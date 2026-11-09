import { LinearGradient } from 'expo-linear-gradient';
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
            style={[styles.banner, shadow.card, { width }]}
          >
            <LinearGradient
              colors={[b.gradient_start || colors.primary, b.gradient_end || colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.bannerInner}>
              <Text style={styles.kicker}>Collection</Text>
              <Text style={styles.title}>{b.title}</Text>
              <Text style={styles.sub}>{b.subtitle}</Text>
            </View>
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
    height: 132,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  bannerInner: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  kicker: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: 4 },
  sub: { color: 'rgba(255,255,255,0.92)', marginTop: 6, fontSize: 14, fontWeight: '500' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 18, backgroundColor: colors.primary },
});
