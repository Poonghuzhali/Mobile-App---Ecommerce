import { useState } from 'react';
import { Platform } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/** Subtle zoom on hover (web) / press feedback (native). */
export function useHoverScale(hoverScale = 1.06) {
  const [hovered, setHovered] = useState(false);
  const scale = useSharedValue(1);

  const onHoverIn = () => {
    if (Platform.OS === 'web') {
      setHovered(true);
      scale.value = withTiming(hoverScale, { duration: 220 });
    }
  };

  const onHoverOut = () => {
    if (Platform.OS === 'web') {
      setHovered(false);
      scale.value = withTiming(1, { duration: 220 });
    }
  };

  const onPressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const onPressOut = () => {
    scale.value = withTiming(hovered ? hoverScale : 1, { duration: 150 });
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animStyle, onHoverIn, onHoverOut, onPressIn, onPressOut };
}
