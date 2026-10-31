# Vexo Cart local dev — Django API + Expo (Android / iOS; mobile app only)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Django API on http://127.0.0.1:8000 ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; ..\venv\Scripts\python manage.py runserver 0.0.0.0:8000"

Start-Sleep -Seconds 3

Write-Host "Starting Expo (scan QR in Expo Go, or press a/i for emulator) ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\mobile'; npx expo start"

Write-Host "Admin panel (staff web UI, not the shopper app): http://127.0.0.1:8000/portal/"
