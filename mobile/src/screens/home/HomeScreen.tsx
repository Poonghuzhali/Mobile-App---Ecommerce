import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import type { Banner, Category, Product } from '../../api/types';
import { BannerCarousel } from '../../components/BannerCarousel';
import { CategoryChip } from '../../components/CategoryChip';
import { ProductCard } from '../../components/ProductCard';
import { Screen } from '../../components/Screen';
import { ErrorView } from '../../components/ui/StateViews';
import { ProductGridSkeleton } from '../../components/ui/Shimmer';
import { API_BASE_URL, APP_NAME } from '../../config';
import { RootStackParamList, TabParamList } from '../../navigation/types';
import { colors, flexScroll, scrollIndicatorHidden, spacing, typography } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<{ banners: Banner[]; categories: Category[]; featured_products: Product[] }>(
        '/catalog/home/',
      );
      setBanners(data.banners ?? []);
      setCategories(data.categories ?? []);
      const featuredList = data.featured_products ?? [];
      if (featuredList.length === 0) {
        const { data: page } = await api.get<{ results?: Product[] }>('/catalog/products/', { params: { page_size: 8 } });
        setFeatured(page.results ?? []);
      } else {
        setFeatured(featuredList);
      }
    } catch (e) {
      setError(getErrorMessage(e, 'Could not load home'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen withFooterPad={false}>
      <ScrollView {...scrollIndicatorHidden} style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topRow}>
          <View>
            <Text style={typography.label}>New arrivals</Text>
            <Text style={typography.display}>{APP_NAME}</Text>
          </View>
          <Pressable style={styles.searchBtn} onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search" size={20} color={colors.primary} />
          </Pressable>
        </View>

        {loading ? (
          <ProductGridSkeleton />
        ) : error ? (
          <ErrorView message={error} onRetry={load} />
        ) : (
          <>
            <BannerCarousel
              banners={banners}
              onPressCategory={(id) => {
                const cat = categories.find((c) => c.id === id);
                navigation.navigate('ProductList', { categoryId: id, title: cat?.name ?? 'Shop' });
              }}
            />
            <Text style={styles.section}>Featured</Text>
            {featured.length === 0 ? (
              <Text style={styles.emptyFeatured}>
                No products loaded. Server: {API_BASE_URL}. Wait ~30s if Render was asleep, then tap Retry above.
              </Text>
            ) : (
              <FlatList
                horizontal
                nestedScrollEnabled
                data={featured}
                keyExtractor={(item) => String(item.id)}
                showsHorizontalScrollIndicator={false}
                style={styles.featuredScroll}
                contentContainerStyle={styles.featuredRow}
                renderItem={({ item, index }) => (
                  <View style={styles.featuredCard}>
                    <ProductCard
                      product={item}
                      index={index}
                      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                    />
                  </View>
                )}
              />
            )}
            <Pressable style={styles.seeAll} onPress={() => navigation.navigate('ProductList', { title: 'All products' })}>
              <Text style={styles.seeAllText}>Browse all products</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </Pressable>
            <Text style={styles.section}>Categories</Text>
            <ScrollView {...scrollIndicatorHidden} horizontal style={[styles.categoryRow, styles.categoryScroll]}>
              {categories.map((c, i) => (
                <CategoryChip
                  key={c.id}
                  category={c}
                  index={i}
                  onPress={() => navigation.navigate('ProductList', { categoryId: c.id, title: c.name })}
                />
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const FEATURED_CARD_WIDTH = 168;
/** ProductCard image + body; explicit height avoids collapsed nested ScrollView gap on web */
const FEATURED_ROW_HEIGHT = 292;
const CATEGORY_ROW_HEIGHT = 128;

const styles = StyleSheet.create({
  scroll: flexScroll,
  scrollContent: { paddingBottom: spacing.sm },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { ...typography.h2, marginTop: spacing.lg, marginBottom: spacing.sm },
  featuredScroll: { height: FEATURED_ROW_HEIGHT },
  featuredRow: { gap: spacing.sm, alignItems: 'flex-start' },
  categoryScroll: { height: CATEGORY_ROW_HEIGHT },
  categoryRow: { marginBottom: spacing.sm },
  featuredCard: { width: FEATURED_CARD_WIDTH },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 8,
  },
  seeAllText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  emptyFeatured: { color: colors.textMuted, fontSize: 13, lineHeight: 20, marginBottom: spacing.md },
});
