import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { Category } from '../api/types';
import { useHoverScale } from '../hooks/useHoverScale';
import { colors, radius, spacing } from '../theme';
import { safeIonicon } from '../utils/ionicon';

const CATEGORY_PHOTOS: Record<string, string> = {
  Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&q=80',
  Fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&q=80',
  Beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=300&q=80',
  Sports: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&q=80',
  Home: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { category: Category; index: number; onPress: () => void };

export function CategoryChip({ category, onPress }: Props) {
  const photo = category.image_url ?? CATEGORY_PHOTOS[category.name];
  const { animStyle, onHoverIn, onHoverOut, onPressIn, onPressOut } = useHoverScale(1.08);

  return (
    <AnimatedPressable
      onPress={onPress}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.chip, animStyle]}
    >
      <Image source={{ uri: photo }} style={styles.image} contentFit="cover" />
      <View style={styles.overlay} />
      <Ionicons
        name={safeIonicon(category.icon)}
        size={16}
        color={colors.primary}
        style={styles.icon}
      />
      <Text style={styles.label}>{category.name}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 112,
    height: 120,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  image: { ...StyleSheet.absoluteFill },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.bgSoft,
  },
  icon: { position: 'absolute', top: 10, left: 10, backgroundColor: colors.surface, padding: 4, borderRadius: 6 },
  label: { position: 'absolute', left: 10, right: 10, bottom: 10, color: colors.text, fontWeight: '600', fontSize: 13 },
});
