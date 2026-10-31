import { createNavigationContainerRef, NavigationState } from '@react-navigation/native';
import type { TabKey } from '../components/navigation/PersistentFooter';
import type { AdminTabKey } from '../components/navigation/AdminPersistentFooter';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function getActiveTabFromState(state: NavigationState | undefined): TabKey {
  if (!state) return 'Home';
  const route = state.routes[state.index ?? 0];
  if (!route) return 'Home';
  if (route.name === 'MainTabs' && route.state) {
    const tabState = route.state as NavigationState;
    const tabRoute = tabState.routes[tabState.index ?? 0];
    return (tabRoute?.name as TabKey) ?? 'Home';
  }
  const stackToTab: Record<string, TabKey> = {
    ProductList: 'Shop',
    ProductDetail: 'Shop',
    Search: 'Shop',
    Checkout: 'Cart',
    OrderDetail: 'Profile',
    Addresses: 'Profile',
    AddressForm: 'Profile',
    Notifications: 'Profile',
  };
  return stackToTab[route.name] ?? 'Home';
}

export function getActiveAdminTabFromState(state: NavigationState | undefined): AdminTabKey {
  if (!state) return 'AdminDashboard';
  const route = state.routes[state.index ?? 0];
  if (route?.name === 'MainTabs' && route.state) {
    const tabState = route.state as NavigationState;
    const tabRoute = tabState.routes[tabState.index ?? 0];
    const name = tabRoute?.name ?? 'AdminDashboard';
    if (name === 'AdminDashboard' || name === 'AdminOrders' || name === 'AdminInventory' || name === 'AdminCustomers' || name === 'AdminAccount') {
      return name;
    }
  }
  if (route?.name === 'AdminOrderManage') return 'AdminOrders';
  return 'AdminDashboard';
}
