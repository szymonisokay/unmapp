import { useEffect, useState } from 'react';

import { repository } from './repository';
import { computeCityProgress } from '@/domain/progress';
import type { CityProgress } from '@/domain/types';

/**
 * How much of a city the user has uncovered — the "Katowice — 63% odkryte"
 * header on `app-design/v1/04-mapa.png`.
 *
 * Returns `null` while the answer is still being fetched. The repository is
 * asynchronous by design, so there is always a first frame with no number, and
 * callers must render something sensible for it rather than assume data.
 */
export function useCityProgress(city: string): CityProgress | null {
  const [progress, setProgress] = useState<CityProgress | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [discoveries, places, totalPlaces] = await Promise.all([
        repository.listDiscoveries(),
        repository.listPlaces(),
        repository.countPlacesInCity(city),
      ]);

      if (!cancelled) {
        setProgress(computeCityProgress(discoveries, places, totalPlaces, city));
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [city]);

  return progress;
}
