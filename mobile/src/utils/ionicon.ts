import { Ionicons } from '@expo/vector-icons';

export function safeIonicon(name: string | undefined | null): keyof typeof Ionicons.glyphMap {
  const fallback: keyof typeof Ionicons.glyphMap = 'grid-outline';
  if (!name) return fallback;
  if (Object.prototype.hasOwnProperty.call(Ionicons.glyphMap, name)) {
    return name as keyof typeof Ionicons.glyphMap;
  }
  return fallback;
}
