import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/design/tokens';
import type { ColorToken } from '@/design/tokens';

/**
 * `surface` is the white card used across most screens.
 * `ink` is the near-black card used for the active mission in 13-misje.
 * `accentSoft` is the outlined peach card used for the partner challenge on the
 * same screen.
 *
 * All three share geometry and differ only in colour, which is why this is one
 * component with a tone rather than three components.
 */
export type CardTone = 'surface' | 'ink' | 'accentSoft';

export interface CardProps {
  children: ReactNode;
  tone?: CardTone;
  style?: ViewStyle;
}

/**
 * Text colour to use on each tone. Callers pass this straight to
 * `<Text color={cardTextColor[tone]}>`, so no screen has to remember that ink
 * cards need cream text.
 */
export const cardTextColor = {
  surface: 'ink',
  ink: 'background',
  accentSoft: 'ink',
} as const satisfies Record<CardTone, ColorToken>;

export function Card({ children, tone = 'surface', style }: CardProps) {
  return <View style={[styles.base, styles[tone], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.md,
  },
  surface: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  ink: {
    backgroundColor: colors.ink,
  },
  accentSoft: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
  },
});
