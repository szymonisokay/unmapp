import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/design/tokens';

export interface ScreenProps {
  children: ReactNode;
  /** Wraps content in a ScrollView. Use for anything taller than the viewport. */
  scroll?: boolean;
  /** Removes the default horizontal gutter, for full-bleed content like maps. */
  bleed?: boolean;
  contentStyle?: ViewStyle;
}

/**
 * The cream page every screen sits on, with padding that clears the notch and
 * the home indicator. Keeps screens from each repeating background and inset
 * handling.
 */
export function Screen({ children, scroll = false, bleed = false, contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();

  const padding = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: insets.bottom + spacing.xl,
    paddingHorizontal: bleed ? 0 : spacing.xl,
  };

  if (scroll) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={[padding, contentStyle]}>
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.screen, padding, contentStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
