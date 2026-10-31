import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import type { Paginated, Product } from '../../api/types';
import { ProductCard } from '../../components/ProductCard';
import { Screen } from '../../components/Screen';
import { Input } from '../../components/ui/Input';
import { ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList } from '../../navigation/types';
import { flexScroll, scrollIndicatorHidden, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export function SearchScreen({ navigation }: Props) {
  const [q, setQ] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<Paginated<Product>>('/catalog/search/', { params: { q } });
      setProducts(data.results);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const searchField = (
    <Input placeholder="Search products or categories…" value={q} onChangeText={setQ} onSubmitEditing={search} returnKeyType="search" />
  );

  return (
    <Screen title="Search">
      {loading ? (
        <>
          {searchField}
          <LoadingView />
        </>
      ) : error ? (
        <>
          {searchField}
          <ErrorView message={error} onRetry={search} />
        </>
      ) : (
        <FlatList
          {...scrollIndicatorHidden}
          style={flexScroll}
          ListHeaderComponent={searchField}
          data={products}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: 40 }}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <View style={{ flex: 1 }}>
              <ProductCard product={item} index={index} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({});
