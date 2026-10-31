import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { Product } from '../api/types';
import { useHoverScale } from '../hooks/useHoverScale';
import { colors, radius, shadow, spacing } from '../theme';
import { getProductImageUri } from '../utils/productImage';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  product: Product;
  index?: number;
  onPress: () => void;
  onWishlist?: () => void;
  wished?: boolean;
};

export function ProductCard({ product, onPress, onWishlist, wished }: Props) {
  const { animStyle, onHoverIn, onHoverOut, onPressIn, onPressOut } = useHoverScale(1.07);
  const hasDiscount = product.discount_price && product.discount_price !== product.price;
  const imageUri = getProductImageUri(product);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedPressable
        onPress={onPress}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.card, shadow.card, animStyle]}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" transition={300} />
          {hasDiscount ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Sale</Text>
            </View>
          ) : null}
          {onWishlist ? (
            <Pressable style={styles.heart} onPress={onWishlist}>
              <Ionicons name={wished ? 'heart' : 'heart-outline'} size={18} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.body}>
          <Text style={styles.category}>{product.category_name}</Text>
          <Text numberOfLines={2} style={styles.name}>
            {product.name}
          </Text>
          <View style={styles.row}>
            <Text style={styles.price}>₹{product.effective_price}</Text>
            {hasDiscount ? <Text style={styles.old}>₹{product.price}</Text> : null}
          </View>
          <View style={styles.meta}>
            <Ionicons name="star" size={12} color={colors.accentGold} />
            <Text style={styles.rating}>{product.rating}</Text>
          </View>
        </View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    flex: 1,
  },
  imageWrap: { height: 168, overflow: 'hidden', backgroundColor: colors.bgElevated },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  body: { padding: spacing.sm + 2 },
  category: { fontSize: 11, color: colors.textMuted, fontWeight: '600' as const },
  name: { color: colors.text, fontWeight: '600', fontSize: 14, minHeight: 38, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  price: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  old: { color: colors.textDim, textDecorationLine: 'line-through', fontSize: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  rating: { color: colors.textMuted, fontSize: 12 },
});
