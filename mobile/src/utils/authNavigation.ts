import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../navigation/navigationRef';

export function resetToCustomerHome() {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    }),
  );
}

export function resetToStaffHome() {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'AdminDashboard' } }],
    }),
  );
}
