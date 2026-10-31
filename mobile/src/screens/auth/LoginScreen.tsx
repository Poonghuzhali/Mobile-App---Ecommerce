import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Screen } from '../../components/Screen';
import { RootStackParamList } from '../../navigation/types';
import { resetToStaffHome } from '../../utils/authNavigation';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { colors, scrollIndicatorHidden, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  const submit = async () => {
    setError('');
    const id = loginId.trim();
    if (!id || !password) {
      setError('Enter your email or username and password.');
      return;
    }
    setLoading(true);
    try {
      const username = id.includes('@') ? id.toLowerCase() : id;
      const { data: tokens } = await api.post('/auth/token/', { username, password });
      setTokens(tokens.access, tokens.refresh);
      const { data: profile } = await api.get('/auth/profile/');
      setUser(profile);
      if (profile.is_staff) {
        resetToStaffHome();
      } else {
        await Promise.all([fetchCart(), fetchWishlist()]);
        navigation.goBack();
      }
    } catch (e) {
      setError(getErrorMessage(e, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Welcome back">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView {...scrollIndicatorHidden} contentContainerStyle={styles.form}>
          <Text style={styles.sub}>
            Customers: sign in with your account. Staff: username admin, password Admin@12345 — opens the staff portal (like /portal/ on web).
          </Text>
          <Input
            label="Email or username"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="username"
            placeholder="you@email.com or username"
            value={loginId}
            onChangeText={setLoginId}
          />
          <Input label="Password" secureTextEntry value={password} onChangeText={setPassword} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Sign in" onPress={submit} loading={loading} />
          <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Create account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { paddingBottom: spacing.xl },
  sub: { color: colors.textMuted, marginBottom: spacing.lg },
  error: { color: colors.error, marginBottom: spacing.md },
  link: { color: colors.primaryLight, textAlign: 'center', marginTop: spacing.md, fontWeight: '600' },
});
