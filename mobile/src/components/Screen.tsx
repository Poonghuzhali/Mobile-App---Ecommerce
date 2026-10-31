import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from './layout/AppBackground';
import { colors, spacing, typography } from '../theme';

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  plain?: boolean;
  withFooterPad?: boolean;
};

export function Screen({ title, subtitle, children, right, style, edges = ['top'], plain }: Props) {
  const content = (
    <SafeAreaView edges={edges} style={[styles.safe, style]}>
      {title ? (
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={typography.h1}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );

  if (plain) return content;
  return <AppBackground>{content}</AppBackground>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.md, backgroundColor: colors.bg },
  body: { flex: 1, minHeight: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  subtitle: { ...typography.caption, marginTop: 4 },
});
