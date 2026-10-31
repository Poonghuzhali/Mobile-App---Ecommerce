import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { navigationRef } from '../../navigation/navigationRef';
import { useCartStore, cartItemCount } from '../../store/cartStore';
import { colors, FOOTER_HEIGHT, spacing } from '../../theme';

export type TabKey = 'Home' | 'Shop' | 'Wishlist' | 'Cart' | 'Profile';

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'Home', label: 'Home', icon: 'home-outline' },
  { key: 'Shop', label: 'Shop', icon: 'grid-outline' },
  { key: 'Wishlist', label: 'Wishlist', icon: 'heart-outline' },
  { key: 'Cart', label: 'Cart', icon: 'cart-outline' },
  { key: 'Profile', label: 'Profile', icon: 'person-outline' },
];

type Props = { activeTab: TabKey };

export function PersistentFooter({ activeTab }: Props) {
  const cart = useCartStore((s) => s.cart);
  const count = cartItemCount(cart);

  const goTab = (tab: TabKey) => {
    if (!navigationRef.isReady()) return;
    if (tab === 'Shop') {
      navigationRef.dispatch(
        CommonActions.navigate({
          name: 'ProductList',
          params: { title: 'All products' },
        }),
      );
      return;
    }
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: { screen: tab },
      }),
    );
  };

  return (
    <View style={styles.footer}>
      {tabs.map((t) => {
        const focused = activeTab === t.key;
        const badge = t.key === 'Cart' && count > 0 ? count : undefined;
        return (
          <Pressable key={t.key} style={styles.item} onPress={() => goTab(t.key)}>
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons name={t.icon} size={22} color={focused ? colors.surface : colors.textMuted} />
              {badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, focused && styles.labelActive]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    minHeight: FOOTER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.footer,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { padding: 6, borderRadius: 8 },
  iconWrapActive: { backgroundColor: colors.primary },
  label: { fontSize: 10, color: colors.textMuted, marginTop: 2, fontWeight: '500' },
  labelActive: { color: colors.primary, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
