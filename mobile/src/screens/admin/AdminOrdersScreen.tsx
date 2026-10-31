import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import type { AdminOrder } from '../../api/types';
import { Screen } from '../../components/Screen';
import { EmptyView, ErrorView, LoadingView } from '../../components/ui/StateViews';
import { AdminTabParamList, RootStackParamList } from '../../navigation/types';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

const STATUS_FILTERS = ['', 'placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

type Props = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, 'AdminOrders'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function AdminOrdersScreen({ navigation }: Props) {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter ? `/admin/orders/?status=${filter}` : '/admin/orders/';
      const { data } = await api.get<AdminOrder[]>(url);
      setItems(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen title="Orders">
      <ScrollView {...scrollIndicatorHidden} horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {STATUS_FILTERS.map((s) => (
          <Pressable key={s || 'all'} style={[styles.chip, filter === s && styles.chipOn]} onPress={() => setFilter(s)}>
            <Text style={[styles.chipText, filter === s && styles.chipTextOn]}>{s ? s.replace(/_/g, ' ') : 'All'}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {loading ? <LoadingView /> : error ? <ErrorView message={error} onRetry={load} /> : (
        <FlatList
          {...scrollIndicatorHidden}
          style={flexScroll}
          data={items}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<EmptyView title="No orders" />}
          contentContainerStyle={{ paddingBottom: spacing.xl + 80, gap: spacing.sm }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => navigation.navigate('AdminOrderManage', { orderId: item.id })}>
              <Text style={styles.id}>{item.order_number}</Text>
              <Text style={styles.line}>{item.customer_name} · {item.customer_email}</Text>
              <Text style={styles.status}>{item.status.replace(/_/g, ' ')} · ₹{item.total}</Text>
              <Text style={styles.link}>Update tracking →</Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { maxHeight: 44, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 12, textTransform: 'capitalize' },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  id: { color: colors.text, fontWeight: '700' },
  line: { color: colors.textMuted, marginTop: 4, fontSize: 13 },
  status: { color: colors.text, marginTop: 6, textTransform: 'capitalize', fontWeight: '600' },
  link: { color: colors.primary, marginTop: spacing.sm, fontWeight: '600', fontSize: 13 },
});
