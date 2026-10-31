import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Django API base URL for Expo Go / dev builds.
 * Physical phones must use your PC LAN IP — not localhost.
 */
function parseHostFromExpo(): string | undefined {
  const raw =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri ??
    (Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } })?.extra?.expoClient?.hostUri ??
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;

  if (!raw) return undefined;
  const host = String(raw).replace(/^https?:\/\//, '').split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return undefined;
  return host;
}

function resolveDevApiHost(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const lanHost = parseHostFromExpo();
  if (lanHost) {
    return `http://${lanHost}:8000/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }

  return 'http://127.0.0.1:8000/api';
}

export const API_BASE_URL = resolveDevApiHost();

export const APP_NAME = 'Vexo Cart';

/** Shown when the app cannot reach Django from a physical device. */
export const API_CONNECT_HINT =
  'Start the backend with: python manage.py runserver 0.0.0.0:8000 — phone and PC on same Wi‑Fi. ' +
  'If it still fails, set EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:8000/api and restart Expo.';
