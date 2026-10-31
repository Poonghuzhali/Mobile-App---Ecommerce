import { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors, radius } from '../../theme';

export function ShimmerBlock({ style, height = 120 }: { style?: ViewStyle; height?: number }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.85, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.block, { height }, style, anim]} />
  );
}

export function ProductGridSkeleton() {
  return (
    <View style={styles.grid}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.cell}>
          <ShimmerBlock height={160} style={{ borderRadius: radius.lg }} />
          <ShimmerBlock height={14} style={{ marginTop: 10, width: '80%' }} />
          <ShimmerBlock height={14} style={{ marginTop: 6, width: '50%' }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.surfaceElevated, borderRadius: radius.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '47%' },
});
