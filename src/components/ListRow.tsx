import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { colors, radius, spacing } from '@/design/tokens';

export interface ListRowProps {
  title: string;
  /** The muted metadata line, e.g. "8 sierpnia · 23 km · nietypowe". */
  subtitle?: string;
  /** Leading square thumbnail. Pass a placeholder view until images exist. */
  leading?: ReactNode;
  /** Trailing value or control, e.g. "50 km" or a switch. */
  trailing?: ReactNode;
  onPress?: () => void;
  /**
   * `card` is the standalone rounded row from 15-dziennik.
   * `grouped` is the flat row inside a settings group from 18-ustawienia, which
   * draws its own separator instead of its own background.
   */
  appearance?: 'card' | 'grouped';
  /** Colours the title with the destructive red, e.g. "Usuń konto". */
  destructive?: boolean;
}

export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  appearance = 'card',
  destructive = false,
}: ListRowProps) {
  const content = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.text}>
        <Text variant={appearance === 'card' ? 'title' : 'body'} color={destructive ? 'danger' : 'ink'}>
          {title}
        </Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.base, styles[appearance]]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[appearance],
        pressed ? styles.pressed : null,
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  grouped: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  leading: {
    width: 56,
    height: 56,
    borderRadius: radius.tile,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  trailing: {
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.7,
  },
});
