import { Platform, ViewStyle } from 'react-native';

/** Hide scroll track/thumb; content still scrolls (wheel, touch, drag). */
export const scrollIndicatorHidden = {
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
} as const;

/** ScrollView / FlatList inside flex screens — required for web + stack navigation. */
export const flexScroll: ViewStyle = Platform.select({
  web: { flex: 1, minHeight: 0, overflow: 'auto' as const },
  default: { flex: 1, minHeight: 0 },
}) as ViewStyle;
