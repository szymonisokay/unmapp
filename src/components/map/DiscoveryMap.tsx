import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
import { StyleSheet } from 'react-native';

import { FALLBACK_CAMERA, MAP_STYLE_URL } from './map-style';
import { colors, spacing } from '@/design/tokens';

/**
 * Mapbox authenticates every tile request with this token. It is a *public*
 * token, meant to ship inside client apps, and comes from `.env.local` via the
 * `EXPO_PUBLIC_` prefix that tells Expo to expose it to the bundle.
 *
 * Called at module scope so it runs exactly once, before any map mounts.
 * Without it the map renders as a blank grey rectangle with no error.
 */
const accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

if (__DEV__ && !accessToken) {
  console.warn(
    'EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN is not set — the map will render blank. ' +
      'Copy .env.example to .env.local, paste the public token, and restart Metro.',
  );
}

Mapbox.setAccessToken(accessToken ?? null);

export interface DiscoveryMapProps {
  /**
   * Where to point the camera. Given in the usual `{ latitude, longitude }`
   * order; the flip to Mapbox's `[longitude, latitude]` happens here, once, so
   * that no caller has to remember it. Getting it backwards puts Katowice in
   * the Indian Ocean and nothing warns you.
   */
  center?: { latitude: number; longitude: number };
  /** Draws the blue dot with its soft halo at the device's position. */
  showUserLocation: boolean;
  /**
   * How far up from the bottom edge to lift the Mapbox logo and attribution, so
   * that whatever floats over the map does not cover them. Mapbox's terms of
   * service require both to stay visible, which is why this is a parameter
   * rather than something left to chance.
   */
  ornamentBottomInset?: number;
}

export function DiscoveryMap({
  center,
  showUserLocation,
  ornamentBottomInset = 0,
}: DiscoveryMapProps) {
  const centerCoordinate: [number, number] = center
    ? [center.longitude, center.latitude]
    : FALLBACK_CAMERA.centerCoordinate;

  return (
    <MapView
      style={styles.map}
      styleURL={MAP_STYLE_URL}
      // The mockup has no map furniture — the scale bar and compass would sit
      // under the floating cards anyway. The Mapbox logo and the attribution
      // notice stay on: they are required by Mapbox's terms of service, not a
      // style choice.
      scaleBarEnabled={false}
      compassEnabled={false}
      logoPosition={{ bottom: ornamentBottomInset, left: spacing.sm }}
      attributionPosition={{ bottom: ornamentBottomInset, left: 92 }}>
      <Camera
        centerCoordinate={centerCoordinate}
        zoomLevel={FALLBACK_CAMERA.zoomLevel}
        animationDuration={center ? 800 : 0}
      />
      {showUserLocation ? (
        <LocationPuck
          puckBearing="heading"
          pulsing={{ isEnabled: true, color: colors.mapHalo, radius: 'accuracy' }}
        />
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
