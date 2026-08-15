import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { colors, radius, spacing } from '@/design/tokens';

/**
 * `primary` is the filled orange action ("Zaczynamy", "Znajdź mi coś nowego").
 * `secondary` is the outlined button that sits beside it ("Filtry", "Inne",
 * "Nawigacja").
 */
export type PillButtonVariant = 'primary' | 'secondary';

export interface PillButtonProps {
  label: string;
  onPress?: () => void;
  variant?: PillButtonVariant;
  disabled?: boolean;
  /** Makes the button fill the width of its container. */
  fill?: boolean;
  style?: ViewStyle;
}

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  fill = false,
  style,
}: PillButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fill ? styles.fill : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}>
      <Text variant="label" color="ink">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fill: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
