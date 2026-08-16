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
 *
 * That count is also returned as `totalPlaces`, because callers need to tell a
 * city the catalogue has never heard of from one the user has simply not
 * started — both are 0%, but only the first is the "NOWA MAPA" state on
 * 10-nowe-miasto.
 *
 * The two halves of the fraction have different provenance, which is worth
 * knowing before trusting the percentage. The numerator is real: discoveries
 * are counted only if their place belongs to this city's map, resolved through
 * `places`. The denominator is still a stand-in — see `PLACE_COUNT_BY_CITY` in
 * `src/data/in-memory-repository.ts` — so the two can disagree, and the
 * `Math.min` below is what keeps the result from exceeding 100% when they do.
 */
export function computeCityProgress(
  discoveries: Discovery[],
  places: Place[],
  totalPlacesInCity: number,
  city: string,
): CityProgress {
  const placesById = new Map(places.map((place) => [place.id, place]));

  const discoveredCount = discoveries.filter((discovery) => {
    // A discovery whose place is unknown is skipped rather than counted, for the
    // same reason as in `computeCategoryCounts`: the catalogue and the journal
    // can legitimately fall out of sync, and counting it would place it in every
    // city at once.
    const place = placesById.get(discovery.placeId);

    return place?.city === city;
  }).length;

  if (totalPlacesInCity <= 0) {
    // Clamped rather than passed through: a negative count is meaningless, and
    // `totalPlaces` is documented as "zero means not covered yet".
    return { city, discoveredCount, totalPlaces: 0, percent: 0 };
  }

  return {
    city,
    discoveredCount,
    totalPlaces: totalPlacesInCity,
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
