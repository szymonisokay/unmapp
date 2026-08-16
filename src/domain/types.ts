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
  /**
   * Which city's map this place belongs to — **not** its postal address.
   *
   * A place can sit in a neighbouring town and still belong to a city's map:
   * 08-odkryto shows "Ukryty punkt widokowy", 23 km out on a spoil tip, moving
   * the bar labelled "Katowice" from 63% to 64,2%. 09-skala-eksploracji explains
   * the model — reach is measured in distance bands (Okolica 0–10 km, Region
   * 10–50 km, Weekend 50–150 km) and "każde miasto ma własną mapę eksploracji".
   *
   * So "Wieża ciśnień w Chorzowie" carries `city: 'Katowice'`, and that is
   * correct rather than a typo. The administrative truth is in the name, which
   * is the part a user reads.
   */
  city: string;
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
  /**
   * How many places the catalogue knows about in this city. Zero means the city
   * is not covered yet, and that is what the "NOWA MAPA" header state on
   * 10-nowe-miasto keys on.
   *
   * Deliberately not inferred from `percent`: a city with six places and none
   * discovered is also 0%, and it is emphatically not a new map — it is a map
   * you have not started. The two facts diverge as soon as the catalogue grows.
   */
  totalPlaces: number;
  /** 0 to 1. */
  percent: number;
}
