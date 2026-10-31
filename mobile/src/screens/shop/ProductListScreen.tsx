import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import type { Paginated, Product } from '../../api/types';
import { ProductCard } from '../../components/ProductCard';
import { Screen } from '../../components/Screen';
import { ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList } from '../../navigation/types';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

const SORTS = [
  { label: 'Newest', value: '-created_at' },
  { label: 'Price ↑', value: 'price' },
  { label: 'Price ↓', value: '-price' },
  { label: 'Rating', value: '-rating' },
];

export function ProductListScreen({ navigation, route }: Props) {
  const { categoryId } = route.params ?? {};
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [inStockOnly, setInStockOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<Paginated<Product>>('/catalog/products/', {
        params: {
          category: categoryId,
          ordering,
          in_stock: inStockOnly || undefined,
        },
      });
      setProducts(data.results ?? (data as unknown as Product[]));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [categoryId, ordering, inStockOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const filters = (
    <View style={styles.filters}>
      <Pressable style={[styles.filterChip, inStockOnly && styles.filterActive]} onPress={() => setInStockOnly((v) => !v)}>
        <Text style={styles.filterText}>In stock</Text>
      </Pressable>
      {SORTS.map((s) => (
        <Pressable key={s.value} style={[styles.filterChip, ordering === s.value && styles.filterActive]} onPress={() => setOrdering(s.value)}>
          <Text style={styles.filterText}>{s.label}</Text>
        </Pressable>
      ))}
    </View>
  );

  if (loading) {
    return (
      <Screen>
        {filters}
        <LoadingView />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        {filters}
        <ErrorView message={error} onRetry={load} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        {...scrollIndicatorHidden}
        style={flexScroll}
        data={products}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.sm }}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={filters}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <View style={styles.cell}>
            <ProductCard product={item} index={index} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: { borderColor: colors.primary, backgroundColor: colors.bgSoft },
  filterText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  cell: { flex: 1, minWidth: 0 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
