import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AdminPersistentFooter, AdminTabKey } from '../components/navigation/AdminPersistentFooter';
import { AdminPanelScreen } from '../screens/admin/AdminPanelScreen';
import { AdminOrdersScreen } from '../screens/admin/AdminOrdersScreen';
import { AdminInventoryScreen } from '../screens/admin/AdminInventoryScreen';
import { AdminCustomersScreen } from '../screens/admin/AdminCustomersScreen';
import { AdminAccountScreen } from '../screens/admin/AdminAccountScreen';
import { colors } from '../theme';
import { AdminTabParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();

function AdminTabBar({ state, navigation }: BottomTabBarProps) {
  const routeName = state.routes[state.index]?.name ?? 'AdminDashboard';
  const activeTab = routeName as AdminTabKey;

  return (
    <AdminPersistentFooter
      activeTab={activeTab}
      onTabPress={(tab) => {
        const target = state.routes.find((r) => r.name === tab);
        if (target) {
          navigation.navigate(tab);
        } else {
          navigation.navigate(tab);
        }
      }}
    />
  );
}

export function AdminTabs() {
  return (
    <Tab.Navigator
      initialRouteName="AdminDashboard"
      tabBar={(props) => <AdminTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { flex: 1, backgroundColor: colors.bgDeep } }}
    >
      <Tab.Screen name="AdminDashboard" component={AdminPanelScreen} />
      <Tab.Screen name="AdminOrders" component={AdminOrdersScreen} />
      <Tab.Screen name="AdminInventory" component={AdminInventoryScreen} />
      <Tab.Screen name="AdminCustomers" component={AdminCustomersScreen} />
      <Tab.Screen name="AdminAccount" component={AdminAccountScreen} />
    </Tab.Navigator>
  );
}
