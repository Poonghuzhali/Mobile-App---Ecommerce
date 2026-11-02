import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/navigation/AppHeader';
import { PersistentFooter, TabKey } from '../components/navigation/PersistentFooter';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { colors } from '../theme';
import { getActiveTabFromState, navigationRef } from './navigationRef';
import { RootStackParamList } from './types';
import { AppMainTabs } from './AppMainTabs';
import { AdminTabs } from './AdminTabs';
import { ProductListScreen } from '../screens/shop/ProductListScreen';
import { ProductDetailScreen } from '../screens/product/ProductDetailScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { AddressesScreen } from '../screens/addresses/AddressesScreen';
import { AddressFormScreen } from '../screens/addresses/AddressFormScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { AdminOrderManageScreen } from '../screens/admin/AdminOrderManageScreen';
import { APP_NAME } from '../config';
import type { UserProfile } from '../api/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

const stackScreenOptions = {
  headerShown: true,
  header: (props: Parameters<typeof AppHeader>[0]) => <AppHeader {...props} />,
  contentStyle: { flex: 1, backgroundColor: colors.bg },
  animation: 'slide_from_right' as const,
};

function BootScreen() {
  return (
    <View style={styles.boot}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.bootText}>Loading {APP_NAME}…</Text>
    </View>
  );
}

export function RootNavigator() {
  const authHydrated = useAuthStore((s) => s.isHydrated);
  const cartHydrated = useCartStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [activeTab, setActiveTab] = useState<TabKey>('Home');
  const [hideFooter, setHideFooter] = useState(false);
  useEffect(() => {
    useAuthStore.getState().setHydrated();
    useCartStore.getState().setHydrated();
  }, []);

  useEffect(() => {
    if (!authHydrated || !accessToken) return;
    api
      .get<UserProfile>('/auth/profile/')
      .then(({ data }) => setUser(data))
      .catch(() => {});
  }, [authHydrated, accessToken, setUser]);

  const hydrated = authHydrated && cartHydrated;
  if (!hydrated) {
    return <BootScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      onReady={() => {
        if (navigationRef.isReady()) {
          const state = navigationRef.getRootState();
          setActiveTab(getActiveTabFromState(state));
          const route = state.routes[state.index ?? 0];
          setHideFooter(route?.name === 'StaffPortal');
        }
      }}
      onStateChange={() => {
        if (navigationRef.isReady()) {
          const state = navigationRef.getRootState();
          setActiveTab(getActiveTabFromState(state));
          const route = state.routes[state.index ?? 0];
          setHideFooter(route?.name === 'StaffPortal');
        }
      }}
    >
      <View style={styles.root}>
        <View style={styles.stackArea}>
          <Stack.Navigator screenOptions={stackScreenOptions}>
            <Stack.Screen name="MainTabs" component={AppMainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="StaffPortal" component={AdminTabs} options={{ headerShown: false, title: 'Staff portal' }} />
            <Stack.Screen name="ProductList" component={ProductListScreen} options={({ route }) => ({ title: route.params.title ?? 'Shop' })} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order' }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in', presentation: 'modal' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot password' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset password' }} />
            <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: 'Addresses' }} />
            <Stack.Screen name="AddressForm" component={AddressFormScreen} options={{ title: 'Address' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
            <Stack.Screen name="AdminOrderManage" component={AdminOrderManageScreen} options={{ title: 'Update order' }} />
          </Stack.Navigator>
        </View>
        {!hideFooter ? <PersistentFooter activeTab={activeTab} /> : null}
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  stackArea: { flex: 1, minHeight: 0 },
  boot: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  bootText: { color: colors.textMuted, fontSize: 15 },
});
