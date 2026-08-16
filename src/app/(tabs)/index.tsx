import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoveryMap } from '@/components/map/DiscoveryMap';
import { MapHeaderCard } from '@/components/map/MapHeaderCard';
import { COLLAPSED_SHEET_HEIGHT, NearbySheet } from '@/components/map/NearbySheet';
import { useCityProgress } from '@/data/use-city-progress';
import { colors, spacing } from '@/design/tokens';
import { useCurrentCity } from '@/location/use-current-city';
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
 * The city normally comes from the user's position. This constant is only what
 * the card falls back to when there is no position to name — permission
 * refused, no fix, or a geocode that failed. It stays Katowice because that is
 * where `FALLBACK_CAMERA` points and where the fixture data lives, so in every
 * one of those cases the header agrees with what the map is actually showing.
 */
const FALLBACK_CITY = 'Katowice';

export default function MapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const location = useUserLocation();

  // `useCityProgress` already re-runs when this changes, so naming a different
  // city is all it takes to repoint the whole header.
  const city = useCurrentCity(location) ?? FALLBACK_CITY;
  const progress = useCityProgress(city);

  // Only `granted` moves the camera. While asking, and after a refusal, the map
  // stays on the fallback city rather than showing a spinner over everything —
  // a map of the right city is more useful than a blocked screen.
  const center = location.status === 'granted' ? location.coords : undefined;

  // In both branches `useCurrentCity` returns null by construction, so `city` is
  // the fallback here — which is correct, because the map really is on Katowice.
  const note =
    location.status === 'denied'
      ? t('map.locationDenied', { city })
      : location.status === 'unavailable'
        ? t('map.locationUnavailable', { city })
        : undefined;

  return (
    <View style={styles.screen}>
      <DiscoveryMap
        center={center}
        showUserLocation={location.status === 'granted'}
        ornamentBottomInset={COLLAPSED_SHEET_HEIGHT + spacing.sm}
      />

      <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
        <MapHeaderCard progress={progress} fallbackCity={city} />
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
