import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
};

export function Button({ title, onPress, loading, variant = 'primary', style, disabled }: Props) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={[
        variant === 'primary' ? styles.primary : styles.ghost,
        variant === 'danger' && styles.danger,
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text style={variant === 'primary' ? styles.primaryText : styles.ghostText}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  ghost: {
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  ghostText: { color: colors.primary, fontWeight: '600' },
  danger: { borderColor: colors.error },
  disabled: { opacity: 0.55 },
});
