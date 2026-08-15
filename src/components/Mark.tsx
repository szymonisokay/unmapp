import { StyleSheet, View } from 'react-native';

import { colors } from '@/design/tokens';
import type { ColorToken } from '@/design/tokens';

/**
 * Which background the mark is drawn on. `app-design/v1/00b-logo.png` shows the
 * same shape in three lockups — on cream, on near-black, and on accent orange —
 * each needing different stroke, fog, and dot colours to stay legible.
 */
export type MarkTone = 'cream' | 'ink' | 'accent';

export interface MarkProps {
  /** Diameter in points. */
  size?: number;
  /**
   * Discovery progress from 0 to 1, which drives how much fog covers the circle.
   * At 0 the fog fills it; at 1 the fog is gone. At 0.5 it sits at the midline,
   * which is the resting state used for the logo itself.
   */
  progress?: number;
  tone?: MarkTone;
}

interface ToneColors {
  stroke: ColorToken;
  fog: ColorToken;
  dot: ColorToken;
}

const TONES: Record<MarkTone, ToneColors> = {
  cream: { stroke: 'ink', fog: 'ink', dot: 'accent' },
  ink: { stroke: 'background', fog: 'background', dot: 'accent' },
  accent: { stroke: 'ink', fog: 'ink', dot: 'surface' },
};

/**
 * The Unmapp sygnet: a map circle partly covered by fog.
 *
 * `app-design/v1/00b-logo.png` states that the same form doubles as a progress
 * indicator — the more of a city that has been discovered, the lower the fog
 * layer sits. That makes this a component rather than an image asset, so the
 * logo in a header and the progress ring on a map screen stay the same shape.
 *
 * Drawn with plain views rather than SVG: a clipped circle, a fog rectangle
 * whose height follows `progress`, and a dot resting on the fog line.
 */
export function Mark({ size = 48, progress = 0.5, tone = 'cream' }: MarkProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const toneColors = TONES[tone];
  const fogHeight = size * (1 - clamped);
  const dotSize = Math.max(4, size * 0.16);
  const strokeWidth = Math.max(1, size * 0.045);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: colors[toneColors.stroke],
        },
      ]}>
      <View
        style={[
          styles.fog,
          { height: fogHeight, backgroundColor: colors[toneColors.fog] },
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: colors[toneColors.dot],
            bottom: fogHeight,
            marginLeft: -dotSize / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  fog: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  dot: {
    position: 'absolute',
    left: '50%',
  },
});
