import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { api, getErrorMessage } from '../../api/client';
import type { Product } from '../../api/types';
import { ProductGallery } from '../../components/ProductGallery';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/ui/Button';
import { ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing, typography } from '../../theme';
import { getProductGallery } from '../../utils/productImage';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const token = useAuthStore((s) => s.accessToken);
  const addItem = useCartStore((s) => s.addItem);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const toggleWishlistItem = useWishlistStore((s) => s.toggleWishlist);
  const inWishlist = useWishlistStore((s) => s.productIds.includes(productId));
  const heartColor = colors.primary;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Product>(`/catalog/products/${productId}/`);
      setProduct(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [productId]);

  useEffect(() => {
    if (token) {
      fetchWishlist();
    }
  }, [token, fetchWishlist]);

  const addToCart = async () => {
    if (!token) {
      navigation.navigate('Login');
      return;
    }
    setAdding(true);
    try {
      await addItem(productId, 1);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = async () => {
    if (!token) {
      navigation.navigate('Login');
      return;
    }
    try {
      await toggleWishlistItem(productId);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  if (loading) return <Screen><LoadingView message="Loading product…" /></Screen>;
  if (error || !product) return <Screen><ErrorView message={error || 'Not found'} onRetry={load} /></Screen>;

  const gallery = getProductGallery(product);
  const hasDiscount = product.discount_price && product.discount_price !== product.price;

  return (
    <Screen>
      <ScrollView {...scrollIndicatorHidden} style={flexScroll} contentContainerStyle={{ paddingBottom: 88 }}>
        <Animated.View entering={FadeInUp.springify()}>
          <ProductGallery urls={gallery} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(80).springify()} style={styles.panel}>
          <Text style={styles.category}>{product.category_name}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.accentGold} />
            <Text style={styles.rating}>{product.rating} rating</Text>
            <Text style={styles.sku}>SKU {product.sku}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.effective_price}</Text>
            {hasDiscount ? <Text style={styles.old}>₹{product.price}</Text> : null}
          </View>
          <View style={[styles.stockBadge, product.stock <= 0 && styles.stockOut]}>
            <Text style={styles.stockText}>{product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</Text>
          </View>
          <Text style={typography.label}>About</Text>
          <Text style={styles.desc}>{product.description}</Text>
        </Animated.View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable style={styles.wishBtn} onPress={toggleWishlist}>
          <Ionicons name={inWishlist ? 'heart' : 'heart-outline'} size={22} color={heartColor} />
        </Pressable>
        <Button title="Add to bag" onPress={addToCart} loading={adding} disabled={product.stock <= 0} style={{ flex: 1 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  category: { ...typography.label, color: colors.textMuted },
  name: { ...typography.h1, marginTop: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  rating: { color: colors.textMuted, fontWeight: '600' },
  sku: { marginLeft: 'auto', color: colors.textDim, fontSize: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.md },
  price: { color: colors.primary, fontSize: 28, fontWeight: '700' },
  old: { color: colors.textDim, textDecorationLine: 'line-through', fontSize: 16 },
  stockBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: colors.bgSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  stockOut: { backgroundColor: 'rgba(196, 92, 92, 0.18)' },
  stockText: { color: colors.success, fontWeight: '700', fontSize: 12 },
  desc: { color: colors.textMuted, lineHeight: 24, marginTop: spacing.sm },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  wishBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
