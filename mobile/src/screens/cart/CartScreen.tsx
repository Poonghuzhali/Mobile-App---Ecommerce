import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/ui/Button';
import { EmptyView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList, TabParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Cart'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function CartScreen({ navigation }: Props) {
  const token = useAuthStore((s) => s.accessToken);
  const cart = useCartStore((s) => s.cart);
  const loading = useCartStore((s) => s.loading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  useFocusEffect(
    useCallback(() => {
      if (token) fetchCart();
    }, [token, fetchCart]),
  );

  if (!token) {
    return (
      <Screen title="Cart">
        <EmptyView title="Sign in to view your cart" subtitle="Your cart persists on the server when logged in" />
        <Button title="Sign in" onPress={() => navigation.navigate('Login')} style={{ margin: spacing.lg }} />
      </Screen>
    );
  }

  if (loading && !cart) return <Screen><LoadingView /></Screen>;

  const items = cart?.items ?? [];

  return (
    <Screen title="Cart">
      <FlatList
        {...scrollIndicatorHidden}
        style={flexScroll}
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 96, gap: spacing.sm }}
        ListEmptyComponent={<EmptyView title="Cart is empty" subtitle="Discover products on Home" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.primary_image ? <Image source={{ uri: item.primary_image }} style={styles.thumb} /> : <View style={[styles.thumb, styles.ph]} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.product_name}</Text>
              <Text style={styles.price}>₹{item.unit_price}</Text>
              <View style={styles.qtyRow}>
                <Pressable onPress={() => updateQuantity(item.product_id, item.quantity - 1)} style={styles.qtyBtn}>
                  <Ionicons name="remove" size={16} color={colors.text} />
                </Pressable>
                <Text style={styles.qty}>{item.quantity}</Text>
                <Pressable onPress={() => updateQuantity(item.product_id, item.quantity + 1)} style={styles.qtyBtn}>
                  <Ionicons name="add" size={16} color={colors.text} />
                </Pressable>
              </View>
            </View>
            <Pressable onPress={() => removeItem(item.product_id)}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </Pressable>
          </View>
        )}
      />
      {items.length > 0 ? (
        <View style={styles.footer}>
          <Text style={styles.total}>Total: ₹{cart?.total}</Text>
          <Button title="Checkout" onPress={() => navigation.navigate('Checkout')} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  thumb: { width: 72, height: 72, borderRadius: radius.sm },
  ph: { backgroundColor: colors.surfaceElevated },
  name: { color: colors.text, fontWeight: '600' },
  price: { color: colors.primaryLight, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  qtyBtn: { backgroundColor: colors.surfaceElevated, padding: 4, borderRadius: 6 },
  qty: { color: colors.text, minWidth: 20, textAlign: 'center' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  total: { color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
});
