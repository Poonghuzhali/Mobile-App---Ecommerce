import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, getErrorMessage } from '../../api/client';
import type { AdminOrder } from '../../api/types';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList } from '../../navigation/types';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

const TRACKING_STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

type Props = NativeStackScreenProps<RootStackParamList, 'AdminOrderManage'>;

export function AdminOrderManageScreen({ route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<AdminOrder>(`/admin/orders/${orderId}/`);
      setOrder(data);
      setStatus(data.status);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = async () => {
    setSaving(true);
    setError('');
    setOk('');
    try {
      const { data } = await api.patch<AdminOrder>(`/admin/orders/${orderId}/status/`, { status, message });
      setOrder(data);
      setOk('Order tracking updated. Customer will be notified.');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Screen><LoadingView /></Screen>;
  if (error && !order) return <Screen><ErrorView message={error} onRetry={load} /></Screen>;
  if (!order) return <Screen><ErrorView message="Order not found" onRetry={load} /></Screen>;

  return (
    <Screen title={order.order_number}>
      <ScrollView {...scrollIndicatorHidden} style={flexScroll} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Text style={styles.meta}>{order.customer_name} · {order.customer_email}</Text>
        <Text style={styles.meta}>Payment: {order.payment_method} ({order.payment_status}) · ₹{order.total}</Text>
        <Text style={styles.section}>Update status</Text>
        <View style={styles.chips}>
          {TRACKING_STEPS.map((s) => (
            <Pressable key={s} style={[styles.chip, status === s && styles.chipOn]} onPress={() => setStatus(s)}>
              <Text style={[styles.chipText, status === s && styles.chipTextOn]}>{s.replace(/_/g, ' ')}</Text>
            </Pressable>
          ))}
        </View>
        <Input label="Note to customer (optional)" value={message} onChangeText={setMessage} placeholder="e.g. Out for delivery with courier" />
        {error ? <Text style={styles.err}>{error}</Text> : null}
        {ok ? <Text style={styles.ok}>{ok}</Text> : null}
        <Button title="Save tracking update" onPress={save} loading={saving} />
        <Text style={styles.section}>Timeline</Text>
        {order.status_history.map((h) => (
          <View key={h.created_at + h.status} style={styles.history}>
            <Text style={styles.hTitle}>{h.status.replace(/_/g, ' ')}</Text>
            {h.message ? <Text style={styles.hMsg}>{h.message}</Text> : null}
            <Text style={styles.hDate}>{new Date(h.created_at).toLocaleString()}</Text>
          </View>
        ))}
        <Text style={styles.section}>Items</Text>
        {order.items.map((item, idx) => (
          <Text key={idx} style={styles.item}>
            {item.product_name} × {item.quantity} — ₹{item.line_total}
          </Text>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { color: colors.textMuted, marginBottom: 4 },
  section: { color: colors.text, fontWeight: '700', fontSize: 17, marginTop: spacing.lg, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 12, textTransform: 'capitalize' },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  err: { color: colors.error, marginBottom: spacing.sm },
  ok: { color: colors.success, marginBottom: spacing.sm, fontWeight: '600' },
  history: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hTitle: { color: colors.text, fontWeight: '600', textTransform: 'capitalize' },
  hMsg: { color: colors.textMuted, marginTop: 4 },
  hDate: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  item: { color: colors.text, marginBottom: 4 },
});
