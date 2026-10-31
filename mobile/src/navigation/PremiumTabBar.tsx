import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, radius, spacing } from '../theme';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Shop: 'grid',
  Wishlist: 'heart',
  Cart: 'cart',
  Profile: 'person',
};

export function PremiumTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.outer}>
      <LinearGradient colors={['rgba(12,18,34,0.2)', 'rgba(12,18,34,0.95)']} style={styles.gradient}>
        <View style={styles.bar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.title ?? route.name;
            const isFocused = state.index === index;
            const icon = icons[route.name] ?? 'ellipse';
            const badge = options.tabBarBadge;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            };

            return <TabItem key={route.key} label={label} icon={icon} focused={isFocused} badge={badge} onPress={onPress} />;
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

function TabItem({
  label,
  icon,
  focused,
  badge,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  badge?: string | number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.92))}
      onPressOut={() => (scale.value = withSpring(1))}
      style={styles.item}
    >
      <Animated.View style={[styles.iconWrap, focused && styles.iconWrapActive, anim]}>
        <Ionicons name={icon} size={22} color={focused ? '#fff' : colors.textMuted} />
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </Animated.View>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  gradient: { paddingTop: 8, paddingBottom: spacing.sm, borderTopWidth: 1, borderColor: colors.border },
  bar: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: spacing.sm },
  item: { alignItems: 'center', flex: 1 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 8 },
  label: { marginTop: 2, fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  labelActive: { color: colors.primarySoft },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
