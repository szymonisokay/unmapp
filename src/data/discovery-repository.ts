import type { Discovery, Place } from '@/domain/types';

/**
 * How screens ask for data. They must not know whether the answer comes from
 * memory, a local database, or a server — swapping the implementation is how
 * later work adds persistence and a backend without touching a single screen.
 *
 * Every method is asynchronous even though the in-memory implementation
 * resolves immediately, because the database and network implementations that
 * replace it will not be able to answer synchronously.
 */
export interface DiscoveryRepository {
  /** Every place the user has recorded visiting, newest first. */
  listDiscoveries(): Promise<Discovery[]>;
  /** The catalogue entry for a place, or null if it is unknown. */
  getPlace(id: string): Promise<Place | null>;
  /** Every place the catalogue knows about. Needed to derive category counts. */
  listPlaces(): Promise<Place[]>;
  /** How many places exist in the given city, for the discovery percentage. */
  countPlacesInCity(city: string): Promise<number>;
  addDiscovery(input: Omit<Discovery, 'id'>): Promise<Discovery>;
  setFavorite(id: string, favorite: boolean): Promise<void>;
}
