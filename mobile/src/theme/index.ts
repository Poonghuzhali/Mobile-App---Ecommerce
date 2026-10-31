import { Platform, ViewStyle } from 'react-native';

/** Hostinger-inspired teal palette */
export const palette = {
  turquoise: '#02ABB0',
  cerulean: '#01A4BD',
  deepTeal: '#035A69',
  darkTeal: '#024E5B',
  paleGrey: '#DCDADE',
} as const;

/** Background tints derived only from palette hues (no off-palette greys) */
const bg = {
  base: palette.paleGrey,
  /** Soft turquoise wash — banners, muted panels */
  washTurquoise: 'rgba(2, 171, 176, 0.22)',
  /** Soft cerulean wash — placeholders, elevated strips */
  washCerulean: 'rgba(1, 164, 189, 0.2)',
  /** Deep teal veil — category overlays, footer tint option */
  washDeep: 'rgba(3, 90, 105, 0.14)',
  /** Gradient top (screen backdrop) */
  gradientTop: 'rgba(2, 171, 176, 0.32)',
  gradientMid: 'rgba(1, 164, 189, 0.12)',
  /** Dark sections (e.g. future hero) */
  deep: palette.deepTeal,
  dark: palette.darkTeal,
} as const;

export const colors = {
  bg: bg.base,
  bgElevated: bg.washCerulean,
  bgSoft: bg.washTurquoise,
  bgDeep: bg.deep,
  bgDark: bg.dark,
  bgGradientTop: bg.gradientTop,
  bgGradientMid: bg.gradientMid,
  surface: '#FFFFFF',
  surfaceMuted: bg.washTurquoise,
  surfaceElevated: bg.washCerulean,
  surfaceGlass: 'rgba(220, 218, 222, 0.92)',
  borderGlow: 'rgba(2, 171, 176, 0.35)',
  primary: palette.turquoise,
  primarySoft: palette.cerulean,
  primaryLight: '#34BEC3',
  primaryDark: palette.darkTeal,
  accent: palette.cerulean,
  accentGold: palette.turquoise,
  success: palette.turquoise,
  warning: palette.deepTeal,
  error: '#C45C5C',
  text: palette.darkTeal,
  textMuted: palette.deepTeal,
  textDim: 'rgba(3, 90, 105, 0.72)',
  border: 'rgba(3, 90, 105, 0.28)',
  borderSoft: 'rgba(2, 171, 176, 0.25)',
  footer: bg.washDeep,
};

export { flexScroll, scrollIndicatorHidden } from './scroll';

export const FOOTER_HEIGHT = 72;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 };
export const radius = { sm: 6, md: 10, lg: 14, xl: 18, pill: 999 };

export const typography = {
  display: { fontSize: 28, fontWeight: '600' as const, color: colors.text, letterSpacing: 0.5 },
  h1: { fontSize: 22, fontWeight: '600' as const, color: colors.text },
  h2: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  caption: { fontSize: 13, color: colors.textMuted, opacity: 0.85 },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    opacity: 0.9,
  },
};

export const shadow: Record<'card', ViewStyle> = {
  card: Platform.select({
    ios: {
      shadowColor: palette.darkTeal,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    android: { elevation: 3 },
    default: {},
  }) as ViewStyle,
};
