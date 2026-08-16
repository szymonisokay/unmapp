import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { UserLocation } from './use-user-location';

/**
 * The name of the city the user is standing in, or `null` when there is no name
 * to show — the position is still being resolved, the user refused to share it,
 * or the geocoder could not turn it into a place.
 *
 * "Reverse geocoding" is the operation underneath: latitude and longitude go in,
 * a postal-style address comes back, and we keep only the locality. On iOS this
 * is Apple's own geocoder, reached through `expo-location`, which is already a
 * dependency and already holds the permission it needs. It requires a network
 * connection and its documentation warns that it is "resource consuming" — this
 * hook issues exactly one request per position, so that limit is never
 * approached.
 *
 * Deliberately driven by the user's position rather than by the centre of the
 * map. The percentage the header shows next to this name is the user's progress
 * in that city, and progress belongs to a person in a place, not to whatever the
 * camera happens to be pointing at — panning to Kraków must not read as "your
 * progress reset to zero". `app-design/v1/10-nowe-miasto.png` says the same
 * thing in the app's own voice: "Jesteś pierwszy raz w Pradze".
 *
 * Resolves once per position, mirroring `useUserLocation`, which reads the
 * position once and does not subscribe. The consequence worth knowing: expo-router
 * keeps tab screens mounted, so crossing a city boundary with the app open leaves
 * the name stale until the app is relaunched. Following the user live belongs to
 * `07-w-drodze.png` and needs `watchPositionAsync` plus a distance threshold
 * before re-geocoding.
 */
/**
 * Which field of a reverse-geocoded address is actually the city.
 *
 * `city` — Apple's "locality" — is the answer nearly everywhere. Verified
 * against the geocoder rather than assumed: Katowice returns
 * `city: "Katowice", region: "Śląskie"`, and a position in the Praga district of
 * Warsaw returns `city: "Warszawa", district: "Praga", region: "Mazowieckie"`.
 * The district is always a field of its own, so it never leaks into the name.
 *
 * Prague is the exception that this function exists for. Its municipal districts
 * are administrative units in their own right, so the city centre comes back as
 * `city: "Praga 2", region: "Praga"`. Reading the locality blindly would split
 * one city into ten separate maps, each with its own progress.
 *
 * Hence the rule: when the region is the start of the city name, the region is
 * the city and the locality is a numbered subdivision of it. Requiring the space
 * keeps it narrow — "Śląskie" is not the start of "Katowice", so Poland is
 * untouched.
 *
 * The `subregion` and `region` fallbacks cover a position outside any town,
 * where Apple leaves `city` null. In Poland `subregion` is the powiat and
 * `region` the województwo, so the card names a wider area rather than nothing.
 */
function pickCityName(
  address: Location.LocationGeocodedAddress | undefined,
): string | null {
  if (!address) {
    return null;
  }

  const { city, subregion, region } = address;

  if (city && region && city.startsWith(`${region} `)) {
    return region;
  }

  return city ?? subregion ?? region ?? null;
}

export function useCurrentCity(location: UserLocation): string | null {
  const [city, setCity] = useState<string | null>(null);

  // Read as primitives rather than as the coords object, so the effect below is
  // keyed on the numbers themselves and cannot be re-run by an identical
  // position arriving as a new object.
  const coords = location.status === 'granted' ? location.coords : null;
  const latitude = coords?.latitude ?? null;
  const longitude = coords?.longitude ?? null;

  useEffect(() => {
    if (latitude === null || longitude === null) {
      // No position: asking, denied, or granted-but-no-fix. Clearing rather than
      // keeping the last name means the caller's fallback city takes over, which
      // is the honest answer — we do not know where the user is.
      setCity(null);
      return;
    }

    const position = { latitude, longitude };

    // Guards against setting state after the screen is gone, which happens
    // whenever someone opens the map and switches tabs before the answer lands.
    let cancelled = false;

    async function resolve() {
      try {
        const addresses = await Location.reverseGeocodeAsync(position);

        if (cancelled) {
          return;
        }

        setCity(pickCityName(addresses[0]));
      } catch {
        // A failed geocode must not take the map screen down with it. The caller
        // falls back to a constant, which is a stale name rather than a blank
        // one; the network being down usually means the map is grey anyway.
        if (!cancelled) {
          setCity(null);
        }
      }
    }

    resolve();

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  return city;
}
