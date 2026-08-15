import type { Category, CityProgress, Discovery, Place } from './types';

/**
 * Every number the app displays about the user is derived from their list of
 * discoveries. These functions are pure — same arguments, same result, no
 * side effects — so they stay correct when the data stops coming from a
 * hardcoded array and starts coming from a database or a server.
 */

/**
 * The "Katowice — 63% odkryte" header on 04-mapa and the progress row on
 * 08-odkryto. `totalPlacesInCity` is how many places the catalogue knows about
 * in that city; a value of 0 or less yields 0% rather than a division by zero.
 */
export function computeCityProgress(
  discoveries: Discovery[],
  totalPlacesInCity: number,
  city: string,
): CityProgress {
  const discoveredCount = discoveries.length;

  if (totalPlacesInCity <= 0) {
    return { city, discoveredCount, percent: 0 };
  }

  return {
    city,
    discoveredCount,
    percent: Math.min(1, discoveredCount / totalPlacesInCity),
  };
}

/**
 * How many discoveries fall into each category — the source for the stat tiles
 * on 14-profil. Every category appears in the result, including ones with a
 * count of zero, so callers can render a stable grid.
 */
export function computeCategoryCounts(
  discoveries: Discovery[],
  places: Place[],
): Record<Category, number> {
  const placesById = new Map(places.map((place) => [place.id, place]));

  const counts: Record<Category, number> = {
    natura: 0,
    historia: 0,
    architektura: 0,
    jedzenie: 0,
    fotografia: 0,
    nietypowe: 0,
    aktywnosc: 0,
  };

  for (const discovery of discoveries) {
    const place = placesById.get(discovery.placeId);
    // A discovery whose place is unknown is skipped rather than throwing: the
    // catalogue and the journal can legitimately fall out of sync, and a
    // profile screen should not crash because of one dangling record.
    if (place) {
      counts[place.category] += 1;
    }
  }

  return counts;
}

/**
 * The five labelled bars under "Twój profil odkrywcy" on 14-profil, as shares
 * of the user's total discoveries. Sorted highest first, and categories with no
 * discoveries are dropped, because the mockup shows a ranked shortlist rather
 * than every category.
 */
export function computeTasteBreakdown(
  discoveries: Discovery[],
  places: Place[],
): Array<{ category: Category; share: number }> {
  const counts = computeCategoryCounts(discoveries, places);
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return [];
  }

  return (Object.keys(counts) as Category[])
    .filter((category) => counts[category] > 0)
    .map((category) => ({ category, share: counts[category] / total }))
    .sort((a, b) => b.share - a.share);
}
