import { useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Banner } from '../api/types';
import { colors, radius, scrollIndicatorHidden, shadow, spacing } from '../theme';

const width = Dimensions.get('window').width - spacing.md * 2;

type Props = { banners: Banner[]; onPressCategory?: (categoryId: number) => void };

export function BannerCarousel({ banners, onPressCategory }: Props) {
  const [index, setIndex] = useState(0);

  if (!banners.length) return null;

  return (
    <View>
      <ScrollView
        {...scrollIndicatorHidden}
        horizontal
        pagingEnabled
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / (width + spacing.sm)))
        }
        scrollEventThrottle={16}
        snapToInterval={width + spacing.sm}
        contentContainerStyle={{ gap: spacing.sm }}
      >
        {banners.map((b) => (
          <Pressable
            key={b.id}
            onPress={() => b.category_id && onPressCategory?.(b.category_id)}
            style={[styles.banner, shadow.card, { width, backgroundColor: colors.surfaceMuted }]}
          >
            <Text style={styles.kicker}>Collection</Text>
            <Text style={styles.title}>{b.title}</Text>
            <Text style={styles.sub}>{b.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {banners.map((b, i) => (
          <View key={b.id} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 120,
    borderRadius: radius.lg,
    padding: spacing.lg,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  kicker: { color: colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 22, fontWeight: '600', marginTop: 4 },
  sub: { color: colors.textMuted, marginTop: 6, fontSize: 14 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 18, backgroundColor: colors.primary },
});
