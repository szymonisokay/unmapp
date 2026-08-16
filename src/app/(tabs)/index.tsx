import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoveryMap } from '@/components/map/DiscoveryMap';
import { MapHeaderCard } from '@/components/map/MapHeaderCard';
import { COLLAPSED_SHEET_HEIGHT, NearbySheet } from '@/components/map/NearbySheet';
import { useCityProgress } from '@/data/use-city-progress';
import { colors, spacing } from '@/design/tokens';
import { useUserLocation } from '@/location/use-user-location';

/**
 * The home screen: `app-design/v1/04-mapa.png`.
 *
 * The map fills the screen edge to edge and runs under the status bar, exactly
 * as in the mockup. The two cards float over it, offset by the safe-area inset
 * at the top and sitting just above the tab bar at the bottom — the tab
 * navigator already excludes its own height from this screen's area, so
 * `bottom` here means "above the tabs".
 *
 * The city is fixed to Katowice because that is the only city the fixture data
 * knows about. Working out which city the user is actually in belongs to
 * `10-nowe-miasto.png`.
 */
const CURRENT_CITY = 'Katowice';

export default function MapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const location = useUserLocation();
  const progress = useCityProgress(CURRENT_CITY);

  // Only `granted` moves the camera. While asking, and after a refusal, the map
  // stays on the fallback city rather than showing a spinner over everything —
  // a map of the right city is more useful than a blocked screen.
  const center = location.status === 'granted' ? location.coords : undefined;

  const note =
    location.status === 'denied'
      ? t('map.locationDenied', { city: CURRENT_CITY })
      : location.status === 'unavailable'
        ? t('map.locationUnavailable', { city: CURRENT_CITY })
        : undefined;

  return (
    <View style={styles.screen}>
      <DiscoveryMap
        center={center}
        showUserLocation={location.status === 'granted'}
        ornamentBottomInset={COLLAPSED_SHEET_HEIGHT + spacing.sm}
      />

      <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
        <MapHeaderCard progress={progress} fallbackCity={CURRENT_CITY} />
      </View>

      <NearbySheet note={note} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
});
