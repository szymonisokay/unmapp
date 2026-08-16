import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Mark } from '@/components/Mark';
import { Text } from '@/components/Text';
import { colors, radius, spacing } from '@/design/tokens';
import type { CityProgress } from '@/domain/types';

export interface MapHeaderCardProps {
  /** `null` while the repository is still answering. */
  progress: CityProgress | null;
  /** Shown before the number arrives, so the card is never empty. */
  fallbackCity: string;
}

/**
 * The floating card at the top of `app-design/v1/04-mapa.png`:
 * "TWOJA MAPA / Katowice — 63% odkryte", with the percentage repeated large on
 * the right.
 *
 * The badge on the left is the app's own sygnet, and its fog level is driven by
 * the same percentage — which is what `Mark` was built for. The number is
 * whatever the discoveries actually produce; nothing here is hardcoded to match
 * the mockup.
 */
export function MapHeaderCard({ progress, fallbackCity }: MapHeaderCardProps) {
  const { t } = useTranslation();

  const percent = progress ? Math.round(progress.percent * 100) : null;
  const city = progress?.city ?? fallbackCity;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.badge}>
          <Mark size={26} progress={progress?.percent ?? 0} tone="accent" />
        </View>

        <View style={styles.labels}>
          <Text variant="eyebrow">{t('map.eyebrow')}</Text>
          <Text variant="label" numberOfLines={1}>
            {percent === null ? city : t('map.cityProgress', { city, percent })}
          </Text>
        </View>

        {percent === null ? null : (
          <View style={styles.percent}>
            <Text variant="title">{percent}</Text>
            <Text variant="caption">%</Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    // Tighter than the default card: this one is a header strip, not a panel.
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labels: {
    flex: 1,
    gap: spacing.xs,
  },
  percent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
