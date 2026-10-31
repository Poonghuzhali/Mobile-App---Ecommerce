import { Image } from 'expo-image';
import { useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, radius, scrollIndicatorHidden, spacing } from '../theme';

const width = Dimensions.get('window').width - spacing.md * 2;

type Props = { urls: string[] };

export function ProductGallery({ urls }: Props) {
  const [index, setIndex] = useState(0);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.wrap}>
      <ScrollView
        {...scrollIndicatorHidden}
        horizontal
        pagingEnabled
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {urls.map((uri, i) => (
          <Image key={`${uri}-${i}`} source={{ uri }} style={[styles.image, { width }]} contentFit="cover" transition={350} />
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {urls.map((u, i) => (
          <View key={u + i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderGlow },
  image: { height: 340, borderRadius: radius.xl },
  dots: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 18, backgroundColor: '#fff' },
});
