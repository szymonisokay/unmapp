import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

/**
 * Where the user is, or a specific reason why we do not know.
 *
 * Every case is a named state rather than `undefined`, because the map has to
 * render something different for each: a dot for `granted`, and the fallback
 * city with an explanation for the two failures. `asking` is the first frame —
 * the permission dialog is up, or the fix has not arrived yet.
 *
 * `denied` and `unavailable` are kept apart deliberately. Denied means the user
 * said no and the app should not pretend otherwise; unavailable means they
 * agreed but the device produced no position — on the Simulator that is the
 * normal result when Features > Location is set to "None".
 */
export type UserLocation =
  | { status: 'asking' | 'denied' | 'unavailable' }
  | { status: 'granted'; coords: { latitude: number; longitude: number } };

/**
 * Asks for foreground location permission once, then reads the position once.
 *
 * Deliberately not a live subscription: `04-mapa.png` centres the map on the
 * user when the screen opens, and nothing on it moves with them. Following the
 * user continuously belongs to the navigation screen (`07-w-drodze.png`).
 */
export function useUserLocation(): UserLocation {
  const [location, setLocation] = useState<UserLocation>({ status: 'asking' });

  useEffect(() => {
    // Guards against setting state after the screen is gone, which happens
    // whenever someone opens the map and switches tabs before the fix lands.
    let cancelled = false;

    async function resolve() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (cancelled) {
        return;
      }

      if (status !== 'granted') {
        setLocation({ status: 'denied' });
        return;
      }

      try {
        const position = await Location.getCurrentPositionAsync({});

        if (!cancelled) {
          setLocation({
            status: 'granted',
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        }
      } catch {
        // Permission was given but no fix came back. Reporting this as `denied`
        // would put a message on screen blaming the user for something they did
        // not do.
        if (!cancelled) {
          setLocation({ status: 'unavailable' });
        }
      }
    }

    resolve();

    return () => {
      cancelled = true;
    };
  }, []);

  return location;
}
