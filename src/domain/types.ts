/**
 * The app's vocabulary. Every screen and every data source speaks in these
 * types, so a typo in a category name is a compile error rather than a filter
 * that silently matches nothing.
 *
 * The identifiers below are ASCII keys, never anything the user reads. Their
 * labels are translated copy and live in `messages/pl.json` and
 * `messages/en.json` under `category`, `transport`, and `timeBudget`, keyed by
 * exactly these strings — so a screen writes `t(\`category.${place.category}\`)`.
 */

/** Fixed by the interest chips in `app-design/v1/02-zainteresowania.png`. */
export type Category =
  | 'natura'
  | 'historia'
  | 'architektura'
  | 'jedzenie'
  | 'fotografia'
  | 'nietypowe'
  | 'aktywnosc';

/** Fixed by the "Czym jedziesz?" row in `app-design/v1/05-zaskocz-mnie.png`. */
export type Transport = 'pieszo' | 'rower' | 'auto' | 'komunikacja';

/** Fixed by the "Ile masz czasu?" row in the same mockup. */
export type TimeBudget = '30min' | '1h' | '2h' | 'polDnia';

/**
 * Somewhere the app can send the user. `dailyVisitors` carries the app's core
 * argument for a place — 06-rekomendacja and 19-szczegoly-miejsca both lean on
 * "fewer than 40 people a day" as the reason it is worth going.
 */
export interface Place {
  id: string;
  name: string;
  summary: string;
  category: Category;
  /** Out of 5, as shown in the stat row of 19-szczegoly-miejsca. */
  rating: number;
  distanceKm: number;
  travelMinutes: number;
  dailyVisitors: number;
}

/** A record that the user visited a place. The journal in 15-dziennik is a list of these. */
export interface Discovery {
  id: string;
  placeId: string;
  /** ISO 8601 timestamp. */
  discoveredAt: string;
  note?: string;
  photoUri?: string;
  favorite: boolean;
}

/** A challenge from 13-misje. */
export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: { done: number; total: number };
  /** ISO 8601 date, when the mission stops counting. Missing means open-ended. */
  expiresAt?: string;
  active: boolean;
}

/** The city header on 04-mapa and the progress row on 08-odkryto. */
export interface CityProgress {
  city: string;
  discoveredCount: number;
  /** 0 to 1. */
  percent: number;
}
