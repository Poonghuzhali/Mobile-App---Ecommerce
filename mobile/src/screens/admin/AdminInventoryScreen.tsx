import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, getErrorMessage } from '../../api/client';
import type { AdminProduct } from '../../api/types';
import { Screen } from '../../components/Screen';
import { Input } from '../../components/ui/Input';
import { EmptyView, ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList } from '../../navigation/types';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminInventory'>;

export function AdminInventoryScreen(_props: Props) {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [draftStock, setDraftStock] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<AdminProduct[]>('/admin/products/');
      setItems(data);
      setDraftStock(Object.fromEntries(data.map((p) => [p.id, String(p.stock)])));
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

  const saveStock = async (productId: number) => {
    const raw = draftStock[productId] ?? '0';
    const stock = parseInt(raw, 10);
    if (Number.isNaN(stock) || stock < 0) {
      setError('Stock must be 0 or more.');
      return;
    }
    setSavingId(productId);
    setError('');
    try {
      const { data } = await api.patch<AdminProduct>(`/admin/products/${productId}/`, { stock });
      setItems((prev) => prev.map((p) => (p.id === productId ? { ...p, ...data } : p)));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSavingId(null);
    }
  };

  const toggleActive = async (product: AdminProduct) => {
    try {
      const { data } = await api.patch<AdminProduct>(`/admin/products/${product.id}/`, { is_active: !product.is_active });
      setItems((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...data } : p)));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <Screen title="Inventory">
      {loading ? <LoadingView /> : error ? <ErrorView message={error} onRetry={load} /> : (
        <FlatList
          {...scrollIndicatorHidden}
          style={flexScroll}
          data={items}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<EmptyView title="No products" />}
          contentContainerStyle={{ paddingBottom: spacing.xl + 80, gap: spacing.sm }}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.is_active && styles.inactive]}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.line}>{item.category_name} · SKU {item.sku}</Text>
              <Text style={styles.line}>₹{item.effective_price} · {item.stock} in stock</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Stock qty"
                    keyboardType="number-pad"
                    value={draftStock[item.id] ?? ''}
                    onChangeText={(v) => setDraftStock((d) => ({ ...d, [item.id]: v }))}
                  />
                </View>
                <Pressable style={styles.saveBtn} onPress={() => saveStock(item.id)} disabled={savingId === item.id}>
                  <Text style={styles.saveText}>{savingId === item.id ? '…' : 'Save'}</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => toggleActive(item)}>
                <Text style={styles.toggle}>{item.is_active ? 'Deactivate product' : 'Activate product'}</Text>
              </Pressable>
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
  inactive: { opacity: 0.65 },
  name: { color: colors.text, fontWeight: '700' },
  line: { color: colors.textMuted, marginTop: 4, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  saveText: { color: '#fff', fontWeight: '700' },
  toggle: { color: colors.primaryLight, fontWeight: '600', marginTop: spacing.xs },
});
