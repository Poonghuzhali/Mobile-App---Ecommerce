# Vexo Cart — mobile app only (Android & iOS via Expo)

Project on Expo: [@poonghuzhalis-team/luxecart-ecommerce](https://expo.dev/accounts/poonghuzhalis-team/projects/luxecart-ecommerce)

## Prerequisites

1. **Backend** running on your PC: `python manage.py runserver 0.0.0.0:8000`
2. **Expo Go** installed on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS](https://apps.apple.com/app/expo-go/id982107779))
3. Phone and PC on the **same Wi‑Fi** (for physical devices)

## Run in Expo Go (recommended for development)

```powershell
cd mobile
npx expo start
```

| Platform | Action |
|----------|--------|
| **Android phone** | Open Expo Go → **Scan QR code** from the terminal |
| **iPhone** | Open **Camera** → scan QR → open in **Expo Go** |
| **Android emulator** | Press **`a`** in the Expo terminal (Android Studio emulator must be running) |
| **iOS simulator** | Press **`i`** (macOS + Xcode only) |

Do **not** expect a full UI at `http://localhost:8081` — that URL serves the Expo **manifest JSON**. The app runs inside **Expo Go** or a native build.

The app auto-detects your PC IP from the Metro connection for the API.

**Home / Shop show “Cannot reach server” on Expo Go?**

1. Backend must listen on all interfaces: `python manage.py runserver 0.0.0.0:8000`
2. Phone and PC on the **same Wi‑Fi** (not mobile data).
3. Allow Python through **Windows Firewall** for port 8000.
4. If it still fails, set your PC IPv4 from `ipconfig`:

```powershell
cd mobile
$env:EXPO_PUBLIC_API_URL="http://192.168.x.x:8000/api"
npx expo start -c
```

Reload the app in Expo Go after changing the URL.

## Standalone installs (optional — EAS Build)

Login: `npx eas-cli login`

| Target | Command |
|--------|---------|
| **Android APK** (share/install) | `npx eas build -p android --profile preview` |
| **iOS** (TestFlight / device) | `npx eas build -p ios --profile preview` |

Download builds from the [Expo project page](https://expo.dev/accounts/poonghuzhalis-team/projects/luxecart-ecommerce).

**Note:** iOS native builds require an Apple Developer account; iOS **Expo Go** testing does not.

## App identifiers

- Android package: `com.poonghuzhalis.luxecart`
- iOS bundle ID: `com.poonghuzhalis.luxecart`
