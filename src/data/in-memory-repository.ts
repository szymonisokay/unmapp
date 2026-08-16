import type { DiscoveryRepository } from './discovery-repository';
import type { Discovery, Place } from '@/domain/types';

/**
 * A repository backed by hardcoded fixtures, with no persistence.
 *
 * Everything here disappears when the app restarts. That is deliberate for the
 * design foundation: screens need correctly shaped data long before they need
 * durable data, and keeping the storage decision open means it can be made once
 * the real requirements are known.
 *
 * The fixtures deliberately mirror the records visible in `app-design/v1/`, so
 * screens built against them look like the design rather than like filler.
 */

const PLACES: Place[] = [
  {
    id: 'p-widokowy',
    name: 'Ukryty punkt widokowy',
    summary: 'Dawna hałda porośnięta brzozami. Widok na całą dolinę.',
    category: 'nietypowe',
    city: 'Katowice',
    rating: 4.7,
    distanceKm: 23,
    travelMinutes: 27,
    dailyVisitors: 40,
  },
  {
    id: 'p-sad',
    name: 'Stary sad w Giszowcu',
    summary: 'Zapomniany sad w środku osiedla patronackiego.',
    category: 'natura',
    city: 'Katowice',
    rating: 4.4,
    distanceKm: 4,
    travelMinutes: 12,
    dailyVisitors: 25,
  },
  {
    id: 'p-wieza',
    name: 'Wieża ciśnień w Chorzowie',
    summary: 'Ceglana wieża z 1905 roku, widoczna z całej okolicy.',
    category: 'architektura',
    // Chorzów, and deliberately on the Katowice map — see the comment on
    // `Place.city`. The same goes for the Dziećkowice reservoir below.
    city: 'Katowice',
    rating: 4.6,
    distanceKm: 11,
    travelMinutes: 18,
    dailyVisitors: 60,
  },
  {
    id: 'p-zalew',
    name: 'Zalew w Dziećkowicach',
    summary: 'Rozległy zbiornik z dziką, wschodnią linią brzegową.',
    category: 'natura',
    city: 'Katowice',
    rating: 4.5,
    distanceKm: 28,
    travelMinutes: 32,
    dailyVisitors: 80,
  },
];

const DISCOVERIES: Discovery[] = [
  { id: 'd-1', placeId: 'p-widokowy', discoveredAt: '2026-08-08T17:20:00Z', favorite: true },
  { id: 'd-2', placeId: 'p-sad', discoveredAt: '2026-08-02T10:05:00Z', favorite: false },
  { id: 'd-3', placeId: 'p-wieza', discoveredAt: '2026-07-26T14:40:00Z', favorite: false },
  { id: 'd-4', placeId: 'p-zalew', discoveredAt: '2026-07-19T09:15:00Z', favorite: true },
];

/** Stand-in for how many places the catalogue knows about, per city. */
const PLACE_COUNT_BY_CITY: Record<string, number> = {
  Katowice: 6,
};

export function createInMemoryRepository(): DiscoveryRepository {
  // Copied so that callers mutating results cannot corrupt the fixtures.
  const discoveries = [...DISCOVERIES];
  let nextId = discoveries.length + 1;

  return {
    async listDiscoveries() {
      return [...discoveries].sort((a, b) => b.discoveredAt.localeCompare(a.discoveredAt));
    },

    async getPlace(id) {
      return PLACES.find((place) => place.id === id) ?? null;
    },

    async listPlaces() {
      return [...PLACES];
    },

    async countPlacesInCity(city) {
      return PLACE_COUNT_BY_CITY[city] ?? 0;
    },

    async addDiscovery(input) {
      const discovery: Discovery = { ...input, id: `d-${nextId++}` };
      discoveries.push(discovery);
      return discovery;
    },

    async setFavorite(id, favorite) {
      const index = discoveries.findIndex((discovery) => discovery.id === id);
      if (index >= 0) {
        discoveries[index] = { ...discoveries[index], favorite };
      }
    },
  };
}
