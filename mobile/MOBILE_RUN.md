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

## Standalone Android APK (EAS Build — uses Render API)

The APK talks to **`https://vexo-cart-api.onrender.com/api`** by default (see `eas.json` → `preview` profile). Change that URL if your Render service has a different hostname.

1. Deploy backend on Render and run once in Shell: `python manage.py seed_demo`
2. Set Render env vars: `RESEND_*`, `RAZORPAY_*` (see root README)
3. Login (once): `npx eas-cli login`
4. Build APK in the cloud:

```powershell
cd mobile
npm install
npm run build:apk
```

5. When the build finishes, open the link in the terminal or [Expo builds](https://expo.dev/accounts/poonghuzhalis-team/projects/luxecart-ecommerce/builds) → **Download** the `.apk`
6. Copy the APK to your phone and install (allow “Install unknown apps” if prompted)

| Profile | Command | Output |
|---------|---------|--------|
| **preview** (recommended) | `npm run build:apk` | Installable **APK** |
| **production-apk** | `npm run build:apk:prod` | APK with version auto-increment |

**Custom API URL for a build:** edit `EXPO_PUBLIC_API_URL` in `eas.json` under the profile’s `env`, or:

```powershell
$env:EXPO_PUBLIC_API_URL="https://your-service.onrender.com/api"
npx eas build -p android --profile preview
```

**Note:** iOS store builds need an Apple Developer account; use **Expo Go** for iOS dev testing.

## App identifiers

- Android package: `com.poonghuzhalis.luxecart`
- iOS bundle ID: `com.poonghuzhalis.luxecart`
