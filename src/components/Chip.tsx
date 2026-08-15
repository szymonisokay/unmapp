import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/Text';
import { colors, radius, spacing } from '@/design/tokens';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * The pill from 02-zainteresowania and 05-zaskocz-mnie. Sizes to its content and
 * wraps onto multiple lines when laid out in a row with `flexWrap`.
 */
export function Chip({ label, selected = false, onPress, disabled = false }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}>
      <Text variant="label" color={selected ? 'ink' : 'textSecondary'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  selected: {
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  unselected: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
