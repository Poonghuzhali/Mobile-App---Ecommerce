import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { api, getErrorMessage } from '../../api/client';
import type { Order } from '../../api/types';
import { Screen } from '../../components/Screen';
import { ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList } from '../../navigation/types';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const STATUS_STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export function OrderDetailScreen({ route }: Props) {
  const { orderId, paymentSuccess } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Order>(`/orders/${orderId}/`);
        setOrder(data);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) return <Screen><LoadingView /></Screen>;
  if (error || !order) return <Screen><ErrorView message={error || 'Not found'} /></Screen>;

  const currentIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <Screen title={order.order_number}>
      <ScrollView {...scrollIndicatorHidden} style={flexScroll} contentContainerStyle={{ paddingBottom: 40 }}>
        {paymentSuccess && order.payment_status === 'paid' ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.successTitle}>Payment successful</Text>
              <Text style={styles.successSub}>
                Your Razorpay test payment went through. Order {order.order_number} is confirmed.
              </Text>
            </View>
          </View>
        ) : null}
        <Text style={styles.meta}>
          Payment: {order.payment_method.toUpperCase()} ({order.payment_status}) · ₹{order.total}
        </Text>
        <Text style={styles.section}>Tracking</Text>
        {STATUS_STEPS.map((step, i) => {
          const done = i <= currentIndex;
          return (
            <Animated.View key={step} entering={FadeInLeft.delay(i * 80)} style={styles.stepRow}>
              <View style={[styles.dot, done && styles.dotDone]} />
              <View>
                <Text style={[styles.stepTitle, done && styles.stepDone]}>{step.replace(/_/g, ' ')}</Text>
              </View>
            </Animated.View>
          );
        })}
        <Text style={styles.section}>Timeline</Text>
        {order.status_history.map((h) => (
          <View key={h.created_at + h.status} style={styles.history}>
            <Text style={styles.historyTitle}>{h.status}</Text>
            <Text style={styles.historyMsg}>{h.message || '—'}</Text>
            <Text style={styles.historyDate}>{new Date(h.created_at).toLocaleString()}</Text>
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successTitle: { color: colors.text, fontWeight: '700', fontSize: 16 },
  successSub: { color: colors.textMuted, marginTop: 4, lineHeight: 20, fontSize: 13 },
  meta: { color: colors.textMuted, marginBottom: spacing.md },
  section: { color: colors.text, fontWeight: '700', fontSize: 17, marginTop: spacing.lg, marginBottom: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  dotDone: { backgroundColor: colors.success },
  stepTitle: { color: colors.textMuted, textTransform: 'capitalize' },
  stepDone: { color: colors.text, fontWeight: '600' },
  history: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyTitle: { color: colors.text, fontWeight: '600', textTransform: 'capitalize' },
  historyMsg: { color: colors.textMuted, marginTop: 4 },
  historyDate: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  item: { color: colors.text, marginBottom: 4 },
});
