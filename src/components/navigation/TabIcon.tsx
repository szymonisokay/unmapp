import { StyleSheet, View, type ColorValue } from 'react-native';

/**
 * The four tab icons in `app-design/v1/04-mapa.png` are outlined geometric
 * shapes rather than pictograms — a square for the map, circles for Odkryj and
 * Profil, a diamond for Misje. They echo the sygnet in `@/components/Mark`.
 *
 * Drawn as plain views: a bordered box, optionally rounded into a circle or
 * rotated into a diamond. Simple enough that an icon font or an SVG dependency
 * would cost more than it saves.
 */
export type TabIconShape = 'square' | 'circle' | 'diamond';

export interface TabIconProps {
  shape: TabIconShape;
  /**
   * Comes from the navigator's active/inactive tint, so it is a raw colour
   * rather than one of our tokens — and `ColorValue`, not `string`, because
   * React Native can also hand back a platform colour object.
   */
  color: ColorValue;
  size?: number;
}

export function TabIcon({ shape, color, size = 24 }: TabIconProps) {
  // The diamond is a rotated square, so it needs to be smaller to end up
  // visually the same weight as the others — its corners reach further.
  const box = shape === 'diamond' ? size * 0.76 : size;

  return (
    <View style={styles.slot}>
      <View
        style={[
          {
            width: box,
            height: box,
            borderColor: color,
            borderWidth: 2,
            borderRadius: shape === 'circle' ? box / 2 : 2,
          },
          shape === 'diamond' ? styles.diamond : null,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // A fixed slot so the rotated diamond does not shift its neighbours.
  slot: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamond: {
    transform: [{ rotate: '45deg' }],
  },
});
