import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/ui/Button';
import { RootStackParamList, AdminTabParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { resetToCustomerHome } from '../../utils/authNavigation';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AdminTabParamList, 'AdminAccount'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function AdminAccountScreen(_props: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const doLogout = async () => {
    try {
      const refresh = useAuthStore.getState().refreshToken;
      if (refresh) await api.post('/auth/logout/', { refresh });
    } catch {
      /* ignore */
    }
    logout();
    resetToCustomerHome();
  };

  return (
    <Screen title="Staff account">
      <ScrollView
        {...scrollIndicatorHidden}
        style={flexScroll}
        contentContainerStyle={{ paddingBottom: spacing.xl + 80 }}
      >
        <Text style={styles.hint}>
          Staff portal — manage orders, inventory, and customers. Sign out to return to the shopper app or log in as a customer.
        </Text>
        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user?.username}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <Button title="Sign out" variant="danger" onPress={doLogout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.textMuted, lineHeight: 22, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  label: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm },
  value: { color: colors.text, fontWeight: '600', fontSize: 16 },
});
