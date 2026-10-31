import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Screen } from '../../components/Screen';
import { RootStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const [token, setToken] = useState(route.params?.token ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/reset-password/', { token, password });
      setMsg(data.detail);
      setTimeout(() => navigation.navigate('Login'), 1200);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Reset password">
      <Input label="Token" value={token} onChangeText={setToken} autoCapitalize="none" />
      <Input label="New password" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {msg ? <Text style={styles.ok}>{msg}</Text> : null}
      <Button title="Update password" onPress={submit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.error, marginBottom: spacing.sm },
  ok: { color: colors.success, marginBottom: spacing.sm },
});
