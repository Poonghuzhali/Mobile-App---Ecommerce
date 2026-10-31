import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import type { Order, UserProfile } from '../../api/types';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList, TabParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ProfileScreen({ navigation }: Props) {
  const { user, accessToken, logout, setUser } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<UserProfile>>({});

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [{ data: profile }, { data: orderData }] = await Promise.all([
        api.get<UserProfile>('/auth/profile/'),
        api.get<{ results?: Order[] } | Order[]>('/orders/'),
      ]);
      setUser(profile);
      setForm(profile);
      const list = Array.isArray(orderData) ? orderData : orderData.results ?? [];
      setOrders(list);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [accessToken, setUser]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch<UserProfile>('/auth/profile/', {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
      });
      setUser(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const doLogout = async () => {
    try {
      const refresh = useAuthStore.getState().refreshToken;
      if (refresh) await api.post('/auth/logout/', { refresh });
    } catch {
      /* ignore */
    }
    logout();
  };

  if (!accessToken) {
    return (
      <Screen title="Profile">
        <Text style={styles.sub}>Sign in to manage orders and addresses</Text>
        <Button title="Sign in" onPress={() => navigation.navigate('Login')} />
        <Button title="Register" variant="ghost" onPress={() => navigation.navigate('Register')} style={{ marginTop: spacing.md }} />
      </Screen>
    );
  }

  if (loading && !user) return <Screen><LoadingView /></Screen>;

  return (
    <Screen title="Profile">
      <ScrollView {...scrollIndicatorHidden} style={flexScroll} contentContainerStyle={{ paddingBottom: spacing.md }}>
        {error ? <ErrorView message={error} onRetry={load} /> : null}
        <View style={styles.card}>
          <Text style={styles.email}>{user?.email}</Text>
          <Input label="First name" value={form.first_name ?? ''} onChangeText={(v) => setForm((f) => ({ ...f, first_name: v }))} />
          <Input label="Last name" value={form.last_name ?? ''} onChangeText={(v) => setForm((f) => ({ ...f, last_name: v }))} />
          <Input label="Phone" value={form.phone ?? ''} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <Button title="Save profile" onPress={saveProfile} loading={saving} />
        </View>
        <MenuRow icon="location-outline" label="Addresses" onPress={() => navigation.navigate('Addresses')} />
        <MenuRow icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
        <Text style={styles.section}>Order history</Text>
        {orders.map((o) => (
          <Pressable key={o.id} style={styles.orderRow} onPress={() => navigation.navigate('OrderDetail', { orderId: o.id })}>
            <Text style={styles.orderId}>{o.order_number}</Text>
            <Text style={styles.orderMeta}>{o.status} · ₹{o.total}</Text>
          </Pressable>
        ))}
        <Button title="Logout" variant="danger" onPress={doLogout} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </Screen>
  );
}

function MenuRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.primaryLight} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sub: { color: colors.textMuted, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  email: { color: colors.textMuted, marginBottom: spacing.md },
  section: { color: colors.text, fontWeight: '700', fontSize: 17, marginVertical: spacing.md },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuLabel: { flex: 1, color: colors.text, fontWeight: '600' },
  orderRow: {
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  orderId: { color: colors.text, fontWeight: '700' },
  orderMeta: { color: colors.textMuted, marginTop: 4, textTransform: 'capitalize' },
});
