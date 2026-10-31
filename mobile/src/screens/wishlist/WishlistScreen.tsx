import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { api, getErrorMessage } from '../../api/client';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/ui/Button';
import { EmptyView, ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList, TabParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type WishItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_price: string;
  product_image: string | null;
};

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Wishlist'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function WishlistScreen({ navigation }: Props) {
  const token = useAuthStore((s) => s.accessToken);
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWishlistStore = useWishlistStore((s) => s.fetchWishlist);
  const toggleWishlistStore = useWishlistStore((s) => s.toggleWishlist);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.get<WishItem[]>('/auth/wishlist/');
      setItems(data);
      await fetchWishlistStore();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [token, fetchWishlistStore]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!token) {
    return (
      <Screen title="Wishlist">
        <EmptyView title="Sign in to save favourites" />
        <Button title="Sign in" onPress={() => navigation.navigate('Login')} style={{ margin: spacing.lg }} />
      </Screen>
    );
  }

  const remove = async (productId: number) => {
    await toggleWishlistStore(productId);
    load();
  };

  return (
    <Screen title="Wishlist">
      {loading ? <LoadingView /> : error ? <ErrorView message={error} onRetry={load} /> : (
        <FlatList
          {...scrollIndicatorHidden}
          style={flexScroll}
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: spacing.md, gap: spacing.sm }}
          ListEmptyComponent={<EmptyView title="No favourites yet" subtitle="Tap ♥ on products you love" />}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => navigation.navigate('ProductDetail', { productId: item.product_id })}>
              {item.product_image ? <Image source={{ uri: item.product_image }} style={styles.thumb} /> : <View style={[styles.thumb, styles.placeholder]} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.product_name}</Text>
                <Text style={styles.price}>₹{item.product_price}</Text>
              </View>
              <Pressable onPress={() => remove(item.product_id)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 64, height: 64, borderRadius: radius.sm },
  placeholder: { backgroundColor: colors.surfaceElevated },
  name: { color: colors.text, fontWeight: '600' },
  price: { color: colors.primaryLight, marginTop: 4 },
  remove: { color: colors.accent, fontWeight: '600' },
});
