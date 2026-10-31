import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';
import { Button } from './Button';

export function LoadingView({ message = 'Loading…' }: { message?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.caption}>{message}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>Oops</Text>
      <Text style={styles.caption} selectable>
        {message}
      </Text>
      {onRetry ? <Button title="Try again" onPress={onRetry} style={{ marginTop: spacing.md, width: 160 }} /> : null}
    </View>
  );
}

export function EmptyView({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>{title}</Text>
      {subtitle ? <Text style={styles.caption}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  caption: { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  errorTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
});
