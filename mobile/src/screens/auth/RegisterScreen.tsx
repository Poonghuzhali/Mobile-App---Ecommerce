import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Screen } from '../../components/Screen';
import { RootStackParamList } from '../../navigation/types';
import { colors, flexScroll, scrollIndicatorHidden, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const sendOtp = async () => {
    setError('');
    setOtpMessage('');
    const email = form.email.trim();
    if (!email) {
      setError('Enter your email first.');
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = await api.post<{ detail: string; delivery?: string; dev_otp?: string }>(
        '/auth/register/send-otp/',
        { email },
      );
      setOtpSent(true);
      if (data.dev_otp) {
        setForm((f) => ({ ...f, otp: data.dev_otp! }));
        setOtpMessage(`${data.detail}\n\nYour code (dev): ${data.dev_otp}`);
      } else {
        setOtpMessage(
          `${data.detail}${
            data.delivery === 'resend' || data.delivery === 'smtp' ? ' Check inbox and spam.' : ''
          }`,
        );
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setOtpLoading(false);
    }
  };

  const submit = async () => {
    setError('');
    if (!otpSent || form.otp.trim().length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register/', { ...form, email: form.email.trim().toLowerCase(), otp: form.otp.trim() });
      navigation.replace('Login');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Create account">
      <ScrollView {...scrollIndicatorHidden} style={flexScroll} contentContainerStyle={styles.form}>
        <Text style={styles.hint}>We verify your email with a one-time code before creating your account.</Text>
        <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set('email')} />
        <View style={styles.otpRow}>
          <View style={{ flex: 1 }}>
            <Input
              label="Email OTP"
              keyboardType="number-pad"
              maxLength={6}
              placeholder="6-digit code"
              value={form.otp}
              onChangeText={set('otp')}
            />
          </View>
          <Button title={otpSent ? 'Resend' : 'Send OTP'} onPress={sendOtp} loading={otpLoading} variant="ghost" style={styles.otpBtn} />
        </View>
        {otpMessage ? (
          <Text style={styles.ok} selectable>
            {otpMessage}
          </Text>
        ) : null}
        <Input label="Username" autoCapitalize="none" value={form.username} onChangeText={set('username')} />
        <Input label="First name" value={form.first_name} onChangeText={set('first_name')} />
        <Input label="Last name" value={form.last_name} onChangeText={set('last_name')} />
        <Input label="Phone" keyboardType="phone-pad" value={form.phone} onChangeText={set('phone')} />
        <Input label="Password" secureTextEntry value={form.password} onChangeText={set('password')} />
        <Input label="Confirm password" secureTextEntry value={form.password_confirm} onChangeText={set('password_confirm')} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Create account" onPress={submit} loading={loading} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { paddingBottom: spacing.xl },
  hint: { color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20, fontSize: 14 },
  otpRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.sm },
  otpBtn: { marginBottom: spacing.sm, minWidth: 100 },
  ok: { color: colors.success, marginBottom: spacing.md, fontSize: 13 },
  error: { color: colors.error, marginBottom: spacing.md },
});
