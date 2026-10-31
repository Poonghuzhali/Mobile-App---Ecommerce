# Configure real SMTP for OTP + order emails (Gmail recommended)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $here ".env"
$example = Join-Path $here ".env.example"

if (-not (Test-Path $envFile)) {
    Copy-Item $example $envFile
    Write-Host "Created backend\.env from .env.example"
}

Write-Host ""
Write-Host "=== Vexo Cart - real email SMTP setup ===" -ForegroundColor Cyan
Write-Host "Gmail: Security -> 2-Step Verification -> App passwords -> Mail"
Write-Host "Use the 16-character App Password ONLY (not your normal Gmail login password)."
Write-Host ""

$email = Read-Host -Prompt "Your Gmail address"
$secure = Read-Host -Prompt "Gmail App Password (16 chars from Google)" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
$plain = ($plain -replace '\s', '')

if ([string]::IsNullOrWhiteSpace($email) -or [string]::IsNullOrWhiteSpace($plain)) {
    Write-Host "Email and app password are required." -ForegroundColor Red
    exit 1
}

$lines = @(Get-Content $envFile -ErrorAction SilentlyContinue)
if ($lines.Count -eq 0) { $lines = @() }

$emailKeys = @(
    "EMAIL_BACKEND", "EMAIL_HOST", "EMAIL_PORT", "EMAIL_USE_TLS", "EMAIL_USE_SSL",
    "EMAIL_HOST_USER", "EMAIL_HOST_PASSWORD", "DEFAULT_FROM_EMAIL", "EMAIL_OTP_EXPIRE_MINUTES"
)

$filtered = foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if ($trimmed -eq "" -or $trimmed.StartsWith("#")) {
        $line
        continue
    }
    $key = ($trimmed -split "=", 2)[0].Trim()
    if ($emailKeys -notcontains $key) { $line }
}

$fromEmail = "Vexo Cart <" + $email + ">"

$block = @(
    ""
    "# Real email OTP and orders - setup-email.ps1"
    "EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend"
    "EMAIL_HOST=smtp.gmail.com"
    "EMAIL_PORT=587"
    "EMAIL_USE_TLS=True"
    "EMAIL_USE_SSL=False"
    "EMAIL_HOST_USER=$email"
    "EMAIL_HOST_PASSWORD=$plain"
    "DEFAULT_FROM_EMAIL=$fromEmail"
    "EMAIL_OTP_EXPIRE_MINUTES=10"
)

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($envFile, @($filtered + $block), $utf8NoBom)

Write-Host ""
Write-Host "Saved SMTP settings to backend\.env" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1. Restart Django: ..\venv\Scripts\python manage.py runserver 0.0.0.0:8000"
Write-Host "  2. Test email:    ..\venv\Scripts\python manage.py test_smtp $email"
Write-Host "  3. In the app: Register -> Send OTP -> check inbox and spam"
Write-Host ""
