import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { colors, radius, spacing } from '@/design/tokens';

export interface StatTileProps {
  /** The large serif figure, e.g. "84" or "18 420 km". */
  value: string;
  /** The muted sans caption under it, e.g. "parki". */
  label: string;
}

/** The number-over-label tile from the stats grid in 14-profil. */
export function StatTile({ value, label }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <Text variant="title">{value}</Text>
      <Text variant="caption">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.xs,
  },
});
