import { Ionicons } from '@expo/vector-icons';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '../../config';
import { colors, spacing } from '../../theme';

function resolveTitle(options: NativeStackHeaderProps['options']): string {
  if (typeof options.title === 'string') return options.title;
  if (typeof options.headerTitle === 'string') return options.headerTitle;
  return APP_NAME;
}

export function AppHeader({ navigation, options, back }: NativeStackHeaderProps) {
  const title = resolveTitle(options);
  const canBack = back != null && navigation.canGoBack();

  const goHome = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {canBack ? (
          <Pressable onPress={navigation.goBack} style={styles.iconBtn} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {typeof title === 'string' ? title : APP_NAME}
        </Text>
        <Pressable onPress={goHome} style={styles.iconBtn} accessibilityLabel="Go home">
          <Ionicons name="home-outline" size={20} color={colors.primary} />
          <Text style={styles.backText}>Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceGlass,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: colors.text, marginHorizontal: spacing.sm },
  iconBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 72, paddingVertical: 6 },
  backText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  placeholder: { minWidth: 72 },
});
