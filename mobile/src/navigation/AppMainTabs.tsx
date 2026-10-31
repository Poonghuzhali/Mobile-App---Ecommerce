import { useAuthStore } from '../store/authStore';
import { AdminTabs } from './AdminTabs';
import { MainTabs } from './MainTabs';

/** Customer shop tabs, or staff portal tabs when admin is signed in. */
export function AppMainTabs() {
  const token = useAuthStore((s) => s.accessToken);
  const isStaff = useAuthStore((s) => s.user?.is_staff === true);
  if (token && isStaff) {
    return <AdminTabs />;
  }
  return <MainTabs />;
}
