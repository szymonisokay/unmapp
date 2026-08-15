import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/design/tokens';
import type { ColorToken } from '@/design/tokens';

export interface ProgressBarProps {
  /** Fraction filled, from 0 to 1. Values outside that range are clamped. */
  value: number;
  /**
   * The unfilled portion. Defaults to the light track colour; on the dark card
   * in 13-misje this must be overridden, since the default is invisible there.
   */
  trackColor?: ColorToken;
  fillColor?: ColorToken;
  height?: number;
}

export function ProgressBar({
  value,
  trackColor = 'track',
  fillColor = 'accent',
  height = 6,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { backgroundColor: colors[trackColor], height }]}>
      <View
        style={[
          styles.fill,
          { backgroundColor: colors[fillColor], width: `${clamped * 100}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
