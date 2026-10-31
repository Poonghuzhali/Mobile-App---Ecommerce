import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import type { Address } from '../../api/types';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/ui/Button';
import { EmptyView, ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList } from '../../navigation/types';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Addresses'>;

function normalizeAddressList(data: Address[] | { results?: Address[] }): Address[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export function AddressesScreen({ navigation, route }: Props) {
  const selectForCheckout = route.params?.selectForCheckout === true;
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Address[] | { results?: Address[] }>('/auth/addresses/');
      setAddresses(normalizeAddressList(data));
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

  const pickForCheckout = (addressId: number) => {
    navigation.navigate('Checkout', { selectedAddressId: addressId });
  };

  const remove = async (id: number) => {
    await api.delete(`/auth/addresses/${id}/`);
    load();
  };

  return (
    <Screen title={selectForCheckout ? 'Choose address' : 'Addresses'}>
      {selectForCheckout ? (
        <Text style={styles.hint}>Tap an address to use it for this order.</Text>
      ) : null}
      <Button
        title="Add address"
        onPress={() => navigation.navigate('AddressForm', { fromCheckout: selectForCheckout })}
        style={{ marginBottom: spacing.md }}
      />
      {loading ? <LoadingView /> : error ? <ErrorView message={error} onRetry={load} /> : (
        <FlatList
          {...scrollIndicatorHidden}
          style={flexScroll}
          data={addresses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ListEmptyComponent={<EmptyView title="No addresses" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                style={styles.cardMain}
                onPress={() =>
                  selectForCheckout ? pickForCheckout(item.id) : navigation.navigate('AddressForm', { addressId: item.id })
                }
              >
                {selectForCheckout ? (
                  <Ionicons name="location-outline" size={20} color={colors.primary} style={styles.pickIcon} />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>
                    {item.label}
                    {item.is_default ? ' · Default' : ''}
                  </Text>
                  <Text style={styles.line}>
                    {item.full_name}, {item.phone}
                  </Text>
                  <Text style={styles.line}>
                    {item.line1}, {item.city}
                  </Text>
                  {selectForCheckout ? <Text style={styles.useLink}>Use this address</Text> : null}
                </View>
                {!selectForCheckout ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
              </Pressable>
              {!selectForCheckout ? (
                <Pressable onPress={() => remove(item.id)} hitSlop={8}>
                  <Text style={styles.delete}>Delete</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pickIcon: { marginTop: 2 },
  title: { color: colors.text, fontWeight: '700' },
  line: { color: colors.textMuted, marginTop: 4 },
  useLink: { color: colors.primary, marginTop: spacing.sm, fontWeight: '600' },
  delete: { color: colors.error, marginTop: spacing.sm, fontWeight: '600' },
});
