import { Platform, ViewStyle } from 'react-native';

/** Warm retail palette — cream base, coral CTA, plum text (shopper-friendly). */
export const palette = {
  cream: '#FFF7F0',
  peach: '#FFE8DC',
  coral: '#FF5C57',
  coralDeep: '#E8443F',
  plum: '#3D2C4E',
  plumSoft: '#5C4A6E',
  gold: '#FFB020',
  mint: '#2CB67D',
} as const;

const bg = {
  base: palette.cream,
  washPeach: 'rgba(255, 92, 87, 0.12)',
  washGold: 'rgba(255, 176, 32, 0.14)',
  washPlum: 'rgba(61, 44, 78, 0.06)',
  gradientTop: 'rgba(255, 92, 87, 0.28)',
  gradientMid: 'rgba(255, 176, 32, 0.12)',
  deep: palette.plum,
  dark: '#2A1F35',
} as const;

export const colors = {
  bg: bg.base,
  bgElevated: palette.peach,
  bgSoft: bg.washPeach,
  bgDeep: bg.deep,
  bgDark: bg.dark,
  bgGradientTop: bg.gradientTop,
  bgGradientMid: bg.gradientMid,
  surface: '#FFFFFF',
  surfaceMuted: '#FFF3EB',
  surfaceElevated: '#FFEFE6',
  surfaceGlass: 'rgba(255, 255, 255, 0.94)',
  borderGlow: 'rgba(255, 92, 87, 0.35)',
  primary: palette.coral,
  primarySoft: palette.coralDeep,
  primaryLight: '#FF7A76',
  primaryDark: palette.coralDeep,
  accent: palette.gold,
  accentGold: palette.gold,
  success: palette.mint,
  warning: palette.gold,
  error: '#D64550',
  text: palette.plum,
  textMuted: palette.plumSoft,
  textDim: 'rgba(61, 44, 78, 0.65)',
  border: 'rgba(61, 44, 78, 0.14)',
  borderSoft: 'rgba(255, 92, 87, 0.2)',
  footer: '#FFF0E8',
};

export { flexScroll, scrollIndicatorHidden } from './scroll';

export const FOOTER_HEIGHT = 72;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const typography = {
  display: { fontSize: 30, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  caption: { fontSize: 13, color: colors.textMuted },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
};

export const shadow: Record<'card', ViewStyle> = {
  card: Platform.select({
    ios: {
      shadowColor: palette.plum,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
    },
    android: { elevation: 4 },
    default: {},
  }) as ViewStyle,
};
