import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import type { Address, Order, RazorpayConfig, RazorpayCreateOrderResponse, RazorpayPaymentSuccess } from '../../api/types';
import { RazorpayCheckoutModal } from '../../components/RazorpayCheckoutModal';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/ui/Button';
import { ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../store/cartStore';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

function normalizeAddressList(data: Address[] | { results?: Address[] }): Address[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export function CheckoutScreen({ navigation, route }: Props) {
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [payment, setPayment] = useState<'cod' | 'gateway'>('cod');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [razorpayPayload, setRazorpayPayload] = useState<RazorpayCreateOrderResponse | null>(null);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);

  const loadAddresses = useCallback(async () => {
    const { data } = await api.get<Address[] | { results?: Address[] }>('/auth/addresses/');
    const list = normalizeAddressList(data);
    setAddresses(list);
    const pickId = route.params?.selectedAddressId;
    if (pickId && list.some((a) => a.id === pickId)) {
      setSelected(pickId);
      navigation.setParams({ selectedAddressId: undefined });
      return list;
    }
    setSelected((prev) => {
      if (prev && list.some((a) => a.id === prev)) return prev;
      const def = list.find((a) => a.is_default) ?? list[0];
      return def?.id ?? null;
    });
    return list;
  }, [navigation, route.params?.selectedAddressId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        setError('');
        try {
          await fetchCart();
          await loadAddresses();
          const { data: rzConfig } = await api.get<RazorpayConfig>('/orders/payment/razorpay/config/');
          if (active) {
            setRazorpayEnabled(rzConfig.enabled && rzConfig.test_mode);
            if (!rzConfig.enabled || !rzConfig.test_mode) {
              setPayment((p) => (p === 'gateway' ? 'cod' : p));
            }
          }
        } catch (e) {
          if (active) setError(getErrorMessage(e));
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [fetchCart, loadAddresses]),
  );

  const finishCodOrder = async () => {
    const { data: order } = await api.post<Order>('/orders/checkout/', {
      address_id: selected,
      payment_method: 'cod',
    });
    await fetchCart();
    navigation.replace('OrderDetail', { orderId: order.id });
  };

  const completeRazorpayOrder = async (payment: RazorpayPaymentSuccess) => {
    const { data: order } = await api.post<Order>('/orders/payment/razorpay/complete/', {
      address_id: selected,
      ...payment,
    });
    setRazorpayOpen(false);
    setRazorpayPayload(null);
    await fetchCart();
    navigation.replace('OrderDetail', { orderId: order.id, paymentSuccess: true });
  };

  const placeOrder = async () => {
    if (!selected) {
      setError('Select a delivery address');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (payment === 'cod') {
        await finishCodOrder();
        return;
      }
      const { data: rzOrder } = await api.post<RazorpayCreateOrderResponse>('/orders/payment/razorpay/create-order/');
      setRazorpayPayload(rzOrder);
      setRazorpayOpen(true);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Screen><LoadingView /></Screen>;

  return (
    <Screen title="Checkout">
      <ScrollView
        {...scrollIndicatorHidden}
        style={flexScroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Text style={styles.section}>Order summary</Text>
        <View style={styles.card}>
          <Text style={styles.line}>{cart?.item_count ?? 0} items</Text>
          <Text style={styles.line}>Subtotal: ₹{cart?.total}</Text>
          <Text style={styles.lineMuted}>Shipping calculated at checkout (free above ₹999)</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.section}>Delivery address</Text>
          {addresses.length > 0 ? (
            <Pressable onPress={() => navigation.navigate('Addresses', { selectForCheckout: true })}>
              <Text style={styles.link}>Choose</Text>
            </Pressable>
          ) : null}
        </View>
        {addresses.length === 0 ? (
          <View style={styles.emptyAddr}>
            <Text style={styles.emptyText}>Add a delivery address to continue.</Text>
            <Button title="Add address" onPress={() => navigation.navigate('AddressForm', { fromCheckout: true })} />
          </View>
        ) : (
          addresses.map((a) => {
            const isSelected = selected === a.id;
            return (
              <Pressable
                key={a.id}
                style={[styles.card, styles.addrCard, isSelected && styles.selected]}
                onPress={() => {
                  setSelected(a.id);
                  setError('');
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.addrRow}>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={isSelected ? colors.primary : colors.textMuted}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addrTitle}>
                      {a.label} · {a.full_name}
                      {a.is_default ? ' · Default' : ''}
                    </Text>
                    <Text style={styles.addrLine}>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</Text>
                    <Text style={styles.addrLine}>
                      {a.city}, {a.state} {a.postal_code}
                    </Text>
                    <Text style={styles.addrLine}>{a.phone}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
        {addresses.length > 0 ? (
          <Button
            title="Add another address"
            variant="ghost"
            onPress={() => navigation.navigate('AddressForm', { fromCheckout: true })}
            style={{ marginBottom: spacing.sm }}
          />
        ) : null}
        <Text style={styles.section}>Payment</Text>
        <Pressable
          style={[styles.card, payment === 'cod' && styles.selected]}
          onPress={() => setPayment('cod')}
          accessibilityRole="radio"
          accessibilityState={{ selected: payment === 'cod' }}
        >
          <Text style={styles.addrTitle}>Cash on Delivery</Text>
        </Pressable>
        {razorpayEnabled ? (
          <Pressable
            style={[styles.card, payment === 'gateway' && styles.selected]}
            onPress={() => setPayment('gateway')}
            accessibilityRole="radio"
            accessibilityState={{ selected: payment === 'gateway' }}
          >
            <Text style={styles.addrTitle}>Razorpay (test mode only)</Text>
            <Text style={styles.payHint}>
              UPI: success@razorpay · Domestic test card: 5267 3181 8797 5449 (any CVV, future expiry). No real money is charged.
            </Text>
          </Pressable>
        ) : null}
        {error ? <ErrorView message={error} /> : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title={payment === 'gateway' ? 'Pay with Razorpay' : 'Place order'}
          onPress={placeOrder}
          loading={submitting}
          disabled={!addresses.length}
        />
      </View>
      <RazorpayCheckoutModal
        visible={razorpayOpen}
        payload={razorpayPayload}
        onSuccess={async (payment) => {
          setSubmitting(true);
          setError('');
          try {
            await completeRazorpayOrder(payment);
          } catch (e) {
            setError(getErrorMessage(e));
            setRazorpayOpen(false);
          } finally {
            setSubmitting(false);
          }
        }}
        onCancel={() => {
          setRazorpayOpen(false);
          setRazorpayPayload(null);
        }}
        onError={(message) => {
          setRazorpayOpen(false);
          setRazorpayPayload(null);
          setError(message);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { color: colors.text, fontSize: 17, fontWeight: '700', marginVertical: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  addrCard: { paddingVertical: spacing.md },
  selected: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.bgSoft },
  line: { color: colors.text, marginBottom: 4 },
  lineMuted: { color: colors.textMuted, fontSize: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: colors.primaryLight, fontWeight: '600' },
  addrRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  addrTitle: { color: colors.text, fontWeight: '600' },
  addrLine: { color: colors.textMuted, marginTop: 4, fontSize: 13 },
  payHint: { color: colors.textMuted, marginTop: 6, fontSize: 12, lineHeight: 18 },
  emptyAddr: { gap: spacing.md, marginBottom: spacing.md },
  emptyText: { color: colors.textMuted },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
});
