# Replace EMAIL_HOST_PASSWORD in .env with a Google App Password (16 chars)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $here ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "Missing .env — run .\setup-email.ps1 first" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Google App Password (NOT your Gmail login password)" -ForegroundColor Cyan
Write-Host "Create one at: https://myaccount.google.com/apppasswords"
Write-Host "Requires 2-Step Verification ON."
Write-Host ""

$secure = Read-Host -Prompt "Paste 16-character App Password" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
$plain = ($plain -replace '\s', '')

if ($plain.Length -ne 16) {
    Write-Host "App passwords are 16 characters (after removing spaces). You entered $($plain.Length)." -ForegroundColor Red
    exit 1
}

$lines = Get-Content $envFile
$out = foreach ($line in $lines) {
    if ($line -match '^\s*EMAIL_HOST_PASSWORD=') {
        "EMAIL_HOST_PASSWORD=$plain"
    } else {
        $line
    }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines($envFile, $out, $utf8NoBom)

Write-Host ""
Write-Host "Updated EMAIL_HOST_PASSWORD in .env" -ForegroundColor Green
Write-Host "Run: ..\venv\Scripts\python manage.py test_smtp YOUR@gmail.com"
Write-Host ""
