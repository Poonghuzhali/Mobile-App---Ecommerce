import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { api, getErrorMessage } from '../../api/client';
import type { NotificationItem } from '../../api/types';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/ui/Button';
import { EmptyView, ErrorView, LoadingView } from '../../components/ui/StateViews';
import { RootStackParamList } from '../../navigation/types';
import { colors, flexScroll, radius, scrollIndicatorHidden, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ results?: NotificationItem[] } | NotificationItem[]>('/notifications/');
      setItems(Array.isArray(data) ? data : data.results ?? []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: number) => {
    await api.post(`/notifications/${id}/read/`);
    load();
  };

  const markAll = async () => {
    await api.post('/notifications/read-all/');
    load();
  };

  return (
    <Screen title="Notifications">
      <Button title="Mark all read" variant="ghost" onPress={markAll} style={{ marginBottom: spacing.md }} />
      {loading ? <LoadingView /> : error ? <ErrorView message={error} onRetry={load} /> : (
        <FlatList
          {...scrollIndicatorHidden}
          style={flexScroll}
          data={items}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<EmptyView title="No notifications" />}
          renderItem={({ item }) => (
            <Pressable style={[styles.card, !item.is_read && styles.unread]} onPress={() => markRead(item.id)}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unread: { borderColor: colors.primary },
  title: { color: colors.text, fontWeight: '700' },
  body: { color: colors.textMuted, marginTop: 4 },
  date: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
});
