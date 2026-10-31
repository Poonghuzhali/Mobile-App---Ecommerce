import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import type { Address } from '../../api/types';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors, flexScroll, scrollIndicatorHidden, spacing } from '../../theme';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddressForm'>;

export function AddressFormScreen({ navigation, route }: Props) {
  const addressId = route.params?.addressId;
  const fromCheckout = route.params?.fromCheckout === true;
  const [form, setForm] = useState({
    label: 'Home',
    full_name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!addressId) return;
    (async () => {
      const { data } = await api.get<Address>(`/auth/addresses/${addressId}/`);
      setForm({
        label: data.label,
        full_name: data.full_name,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        is_default: data.is_default,
      });
    })();
  }, [addressId]);

  const set = (key: keyof typeof form) => (v: string | boolean) => setForm((f) => ({ ...f, [key]: v }));

  const save = async () => {
    setLoading(true);
    setError('');
    try {
      if (addressId) {
        await api.patch(`/auth/addresses/${addressId}/`, form);
        if (fromCheckout) {
          navigation.navigate('Checkout', { selectedAddressId: addressId });
        } else {
          navigation.goBack();
        }
      } else {
        const { data } = await api.post<Address>('/auth/addresses/', form);
        if (fromCheckout) {
          navigation.navigate('Checkout', { selectedAddressId: data.id });
        } else {
          navigation.goBack();
        }
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title={addressId ? 'Edit address' : 'New address'}>
      <ScrollView {...scrollIndicatorHidden} style={flexScroll}>
        <Input label="Label" value={form.label} onChangeText={set('label') as (v: string) => void} />
        <Input label="Full name" value={form.full_name} onChangeText={set('full_name') as (v: string) => void} />
        <Input label="Phone" value={form.phone} onChangeText={set('phone') as (v: string) => void} />
        <Input label="Address line 1" value={form.line1} onChangeText={set('line1') as (v: string) => void} />
        <Input label="Address line 2" value={form.line2} onChangeText={set('line2') as (v: string) => void} />
        <Input label="City" value={form.city} onChangeText={set('city') as (v: string) => void} />
        <Input label="State" value={form.state} onChangeText={set('state') as (v: string) => void} />
        <Input label="Postal code" value={form.postal_code} onChangeText={set('postal_code') as (v: string) => void} />
        <View style={styles.row}>
          <Text style={styles.switchLabel}>Default address</Text>
          <Switch value={form.is_default} onValueChange={set('is_default') as (v: boolean) => void} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Save" onPress={save} loading={loading} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  switchLabel: { color: colors.text },
  error: { color: colors.error, marginBottom: spacing.md },
});
