import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography } from '@/design/tokens';
import type { ColorToken, TypographyVariant } from '@/design/tokens';

export interface TextProps extends RNTextProps {
  /** Which role from the type ramp to use. Defaults to running body text. */
  variant?: TypographyVariant;
  /** Overrides the variant's colour — needed on dark and accent surfaces. */
  color?: ColorToken;
}

/**
 * Every piece of text in the app goes through this component, so that changing
 * a face or a size is a one-file change rather than a search across screens.
 */
export function Text({ variant = 'body', color, style, ...rest }: TextProps) {
  return (
    <RNText style={[typography[variant], color ? { color: colors[color] } : null, style]} {...rest} />
  );
}
