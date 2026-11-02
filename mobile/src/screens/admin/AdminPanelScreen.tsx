import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import type { AdminOrder, AdminStats } from '../../api/types';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/ui/Button';
import { ErrorView, LoadingView } from '../../components/ui/StateViews';
import { AdminTabParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { navigationRef } from '../../navigation/navigationRef';
import { resetToCustomerHome } from '../../utils/authNavigation';
import { CommonActions } from '@react-navigation/native';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type Props = BottomTabScreenProps<AdminTabParamList, 'AdminDashboard'>;

export function AdminPanelScreen({ navigation }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: statsData }, { data: orders }] = await Promise.all([
        api.get<AdminStats>('/admin/stats/'),
        api.get<AdminOrder[]>('/admin/orders/'),
      ]);
      setStats(statsData);
      setRecentOrders(orders.slice(0, 5));
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

  const signOut = async () => {
    try {
      const refresh = useAuthStore.getState().refreshToken;
      if (refresh) await api.post('/auth/logout/', { refresh });
    } catch {
      /* ignore */
    }
    logout();
    resetToCustomerHome();
  };

  if (loading && !stats) {
    return (
      <Screen title="Dashboard">
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen
      title="Dashboard"
      plain
      right={
        <Pressable onPress={signOut} hitSlop={8} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
        </Pressable>
      }
    >
      <ScrollView
        {...scrollIndicatorHidden}
        style={flexScroll}
        contentContainerStyle={{ paddingBottom: spacing.xl + 80 }}
      >
        <Text style={styles.portalTag}>Staff portal</Text>
        <Text style={styles.sub}>Manage store operations — same data as web /portal/</Text>
        {error ? <ErrorView message={error} onRetry={load} /> : null}
        {stats ? (
          <>
            <View style={styles.statsRow}>
              <StatBox label="Total sales (₹)" value={stats.total_sales} />
              <StatBox label="Orders" value={String(stats.order_count)} />
            </View>
            <View style={styles.statsRow}>
              <StatBox label="Customers" value={String(stats.customer_count)} />
              <StatBox label="Low stock" value={String(stats.low_stock_count)} />
            </View>
          </>
        ) : null}
        <Text style={styles.section}>Quick access</Text>
        <QuickTile icon="receipt-outline" title="Orders & delivery tracking" onPress={() => navigation.navigate('AdminOrders')} />
        <QuickTile icon="cube-outline" title="Inventory & stock" onPress={() => navigation.navigate('AdminInventory')} />
        <QuickTile icon="people-outline" title="Customers" onPress={() => navigation.navigate('AdminCustomers')} />
        <QuickTile icon="person-outline" title="Account & sign out" onPress={() => navigation.navigate('AdminAccount')} />
        <QuickTile
          icon="storefront-outline"
          title="Back to store (products)"
          onPress={() => {
            if (navigationRef.isReady()) {
              navigationRef.dispatch(CommonActions.navigate({ name: 'MainTabs', params: { screen: 'Home' } }));
            }
          }}
        />
        {recentOrders.length > 0 ? (
          <>
            <Text style={styles.section}>Recent orders</Text>
            {recentOrders.map((o) => (
              <View key={o.id} style={styles.orderRow}>
                <Text style={styles.orderId}>{o.order_number}</Text>
                <Text style={styles.orderMeta}>
                  {o.customer_name} · {o.status.replace(/_/g, ' ')} · ₹{o.total}
                </Text>
              </View>
            ))}
            <Button title="View all orders" variant="ghost" onPress={() => navigation.navigate('AdminOrders')} />
          </>
        ) : null}
        <Button title="Sign out" variant="danger" onPress={signOut} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </Screen>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickTile({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.tileTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  signOutBtn: { padding: 6 },
  portalTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  sub: { color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 22 },
  section: { color: colors.text, fontWeight: '700', fontSize: 17, marginTop: spacing.lg, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { color: colors.primary, fontWeight: '700', fontSize: 20 },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileTitle: { flex: 1, color: colors.text, fontWeight: '600' },
  orderRow: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  orderId: { color: colors.text, fontWeight: '700' },
  orderMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
});
