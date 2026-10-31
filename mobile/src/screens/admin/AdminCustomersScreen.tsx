import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, getErrorMessage } from '../../api/client';
import type { AdminCustomer } from '../../api/types';
import { Screen } from '../../components/Screen';
import { EmptyView, ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList } from '../../navigation/types';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminCustomers'>;

export function AdminCustomersScreen(_props: Props) {
  const [items, setItems] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<AdminCustomer[]>('/admin/customers/');
      setItems(data);
    } catch (e) {
      setError(getErrorMessage(e));
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
    <Screen title="Customers">
      {loading ? <LoadingView /> : error ? <ErrorView message={error} onRetry={load} /> : (
        <FlatList
          {...scrollIndicatorHidden}
          style={flexScroll}
          data={items}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<EmptyView title="No customers yet" />}
          contentContainerStyle={{ paddingBottom: spacing.xl + 80, gap: spacing.sm }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.first_name} {item.last_name} ({item.username})</Text>
              <Text style={styles.line}>{item.email}</Text>
              {item.phone ? <Text style={styles.line}>{item.phone}</Text> : null}
              <Text style={styles.meta}>{item.order_count} orders</Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { color: colors.text, fontWeight: '700' },
  line: { color: colors.textMuted, marginTop: 4 },
  meta: { color: colors.primary, marginTop: spacing.sm, fontWeight: '600', fontSize: 13 },
});
