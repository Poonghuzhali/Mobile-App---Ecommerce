import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, FOOTER_HEIGHT, spacing } from '../../theme';

export type AdminTabKey = 'AdminDashboard' | 'AdminOrders' | 'AdminInventory' | 'AdminCustomers' | 'AdminAccount';

const tabs: { key: AdminTabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'AdminDashboard', label: 'Dashboard', icon: 'speedometer-outline' },
  { key: 'AdminOrders', label: 'Orders', icon: 'receipt-outline' },
  { key: 'AdminInventory', label: 'Stock', icon: 'cube-outline' },
  { key: 'AdminCustomers', label: 'Customers', icon: 'people-outline' },
  { key: 'AdminAccount', label: 'Account', icon: 'person-outline' },
];

type Props = {
  activeTab: AdminTabKey;
  onTabPress: (tab: AdminTabKey) => void;
};

export function AdminPersistentFooter({ activeTab, onTabPress }: Props) {
  return (
    <View style={styles.footer}>
      <Text style={styles.brand}>Vexo Cart · Staff portal</Text>
      <View style={styles.row}>
        {tabs.map((t) => {
          const focused = activeTab === t.key;
          return (
            <Pressable key={t.key} style={styles.item} onPress={() => onTabPress(t.key)} accessibilityRole="button">
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Ionicons name={t.icon} size={20} color={focused ? colors.surface : colors.textMuted} />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    minHeight: FOOTER_HEIGHT + 8,
    backgroundColor: colors.bgDeep,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  brand: {
    textAlign: 'center',
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  iconWrap: { padding: 5, borderRadius: 8 },
  iconWrapActive: { backgroundColor: colors.primary },
  label: { fontSize: 9, color: colors.textMuted, marginTop: 2, fontWeight: '500' },
  labelActive: { color: colors.primaryLight, fontWeight: '700' },
});
