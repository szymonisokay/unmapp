# Name the city from the user's position instead of hardcoding Katowice

**IMPLEMENTER INSTRUCTION: Keep this plan up to date as you work.**
After each significant step, update the `Progress` section with what was done and what's next. If context is lost or you are interrupted, the plan must contain everything needed to resume. Treat the plan as the single source of truth for this work.

This ExecPlan is a living document. The sections `Progress`, `Surprises &
Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept
up to date as work proceeds.

Reference: This plan follows conventions from AGENTS.md (root) and
docs/exec-plans/create-plan-file.md.

## Purpose / Big Picture

The header card on the map screen reads "TWOJA MAPA / Katowice — 67% odkryte".
The word "Katowice" is a constant written into `src/app/(tabs)/index.tsx`. Open
the app anywhere on earth and it still says Katowice, which is wrong everywhere
except one city and looks like a placeholder even there.

After this change the card names the city the user is actually standing in,
worked out from the position the app already asks for. Someone who opens the app
in Kraków sees Kraków. Someone who opens it in a city the app has no places for —
which today means every city except Katowice — sees the second state the design
already specifies in `app-design/v1/10-nowe-miasto.png`: the eyebrow changes from
"TWOJA MAPA" to "NOWA MAPA", and the percentage is 0.

You can see it working by changing the simulated position in the iOS Simulator
(Features > Location > Custom Location), relaunching the app, and watching the
header follow. Concrete pairs to try are given in Validation and Acceptance.

A **reverse geocode** is the operation this rests on: it turns a latitude and
longitude into a postal-style address, from which we take only the city. On iOS
it is performed by Apple's own geocoder, reached through the `expo-location`
package that is already installed. Nothing is added to `package.json`, and no
native configuration changes, so **no rebuild is needed** — the change arrives
over Fast Refresh.

## Bird's Eye View

Before — the city is a constant, and everything downstream inherits it:

    src/app/(tabs)/index.tsx
      const CURRENT_CITY = 'Katowice'        <-- written into the source
          |
          +--> useCityProgress('Katowice')   --> repository.countPlacesInCity
          |                                       -> 6, so 4/6 = 67%
          +--> <MapHeaderCard fallbackCity="Katowice">
          |         eyebrow is always t('map.eyebrow') = "Twoja mapa"
          |
          +--> t('map.locationDenied', { city: 'Katowice' })

After — the city comes from the position the app already reads:

    useUserLocation()  (already exists, unchanged)
      { status: 'granted', coords: { latitude, longitude } }
          |
          v
    useCurrentCity(location)   <-- NEW, src/location/use-current-city.ts
      Location.reverseGeocodeAsync({ latitude, longitude })
          |  returns [{ city: 'Kraków', region: ..., country: ... }, ...]
          v
      string | null            null = still resolving, or could not be named
          |
          v
    src/app/(tabs)/index.tsx
      const city = useCurrentCity(location) ?? FALLBACK_CITY
          |
          +--> useCityProgress(city)         --> repository.countPlacesInCity
          |                                       -> 0 for anywhere but Katowice
          +--> <MapHeaderCard fallbackCity={city}>
          |         eyebrow is t('map.newCityEyebrow') when the catalogue
          |         knows no places here, t('map.eyebrow') otherwise
          |
          +--> t('map.locationDenied', { city })

What changes, at a glance:

    REMOVED                   ADDED                        UNCHANGED
    CURRENT_CITY constant     use-current-city.ts hook     useUserLocation
    (renamed FALLBACK_CITY,   totalPlaces on CityProgress  the map itself
     now only a last resort)  map.newCityEyebrow copy      NearbySheet
                              eyebrow switch in the card   the repository interface
                                                           every design token
                                                           package.json, app.config.ts

Where the two numbers in the card come from, end to end:

    position (CoreLocation)
        |
        +--> reverse geocode (Apple) ------> "Kraków"  ---------+
        |                                                       |
        v                                                       v
    repository.countPlacesInCity("Kraków") -> 0          the city line
        |                                                "Kraków — 0% odkryte"
        v
    repository.listDiscoveries() -> 4 fixture records
        |
        v
    computeCityProgress(discoveries, 0, "Kraków")
        -> { city: "Kraków", discoveredCount: 4, totalPlaces: 0, percent: 0 }
                                              |
                                              +--> totalPlaces === 0
                                                   so the eyebrow reads
                                                   "NOWA MAPA"

## Assumptions

The app is developed on a Mac against the iOS Simulator, and a Metro instance is
already running in the background. Per AGENTS.md the implementer attaches to it
and never starts one; if nothing is running, say so and stop.

The device language is Polish, so Apple's geocoder returns Polish city names.
This matters and is not merely cosmetic — see the Decision Log entry on
localization, which records that an English device will produce "Prague" where
the map itself draws "Praha".

`discoveredCount` on `CityProgress` counts **every** discovery the user has, not
the ones in the named city, because `Place` has no `city` field to filter on.
That is wrong the moment the city stops being a constant. It is left wrong on
purpose and is invisible: nothing renders `discoveredCount` today. See the
Decision Log for why fixing it is a separate piece of work, and Outcomes for
what fixing it would involve.

The four fixture discoveries in `src/data/in-memory-repository.ts` and the
`PLACE_COUNT_BY_CITY` map of `{ Katowice: 6 }` stay exactly as they are. This
plan changes which city is asked about, not what the answers are.

## Open Questions

None. All three were asked and answered before this plan was written — see the
Decision Log entries for the city source, the empty-city state, and the geocoder.

## Progress

- [x] (2026-08-16 22:45Z) Read `app-design/v1/04-mapa.png` and
      `app-design/v1/10-nowe-miasto.png` side by side; confirmed the two states
      share a layout and differ only in the eyebrow and the numbers.
- [x] (2026-08-16 22:47Z) Plan approved by Szymon after all three open questions
      were answered — see the Decision Log.
- [x] (2026-08-16 22:50Z) Added `totalPlaces` to `CityProgress` and returned it
      from `computeCityProgress`, clamped to 0 in the guard branch.
- [x] (2026-08-16 22:51Z) Wrote `src/location/use-current-city.ts`.
- [x] (2026-08-16 22:52Z) Added `map.newCityEyebrow` to `messages/pl.json` then
      `messages/en.json`; switched the eyebrow in `MapHeaderCard`; renamed the
      constant to `FALLBACK_CITY` and wired the hook in `(tabs)/index.tsx`.
- [x] (2026-08-16 22:53Z) `npx tsc --noEmit` exit 0 and
      `npx expo export --platform ios` exit 0.
- [x] (2026-08-16 22:55Z) First Simulator check. Katowice correct; Prague
      revealed the geocoder returning the municipal district — see Surprises.
- [x] (2026-08-16 22:58Z) Established the real geocoder output for three
      positions by logging it rather than guessing, and added `pickCityName` to
      handle Prague without disturbing Poland. Diagnostic logging removed.
- [x] (2026-08-16 23:00Z) All three acceptance scenarios verified on the
      Simulator: Katowice reads "TWOJA MAPA / Katowice — 67% odkryte", Prague
      reads "NOWA MAPA / Praga — 0% odkryte", and a revoked permission falls back
      to Katowice with the note "Bez dostępu do lokalizacji mapa pokazuje
      Katowice." Simulator restored to Katowice with permission granted.
- [x] (2026-08-16 23:01Z) README.md: one line, the `src/location/` entry in the
      layout tree, now that the folder holds two hooks. Nothing else needed —
      no script, alias, native config, or hard constraint changed.
- [x] (2026-08-16 23:02Z) Moved this plan to `docs/exec-plans/completed/`.

## Surprises & Discoveries

- Observation: Apple's geocoder does not always put the city in the `city` field.
  In Prague it returns the municipal district. The plan's own acceptance
  scenario, which expected "Praga", produced "Praga 2" on screen — a name that
  would split one city into ten separate maps, each with its own progress.
  Evidence: a temporary `__DEV__` log of the raw `reverseGeocodeAsync` result at
  three simulated positions, which is what turned a guess into a rule.

      Praha 2   city "Praga 2"  district "Náměstí Míru"
                subregion null            region "Praga"      country "Czechy"
      Warszawa  city "Warszawa" district "Praga"
                subregion "Powiat warszawa" region "Mazowieckie" country "Polska"
      Katowice  city "Katowice" district "Koszutka"
                subregion "Powiat katowice" region "Śląskie"  country "Polska"

  The Warsaw row is the useful control: it is a position in Warsaw's *Praga*
  district, and the district lands in its own field rather than in `city`. So
  districts are not the general problem — Prague specifically reports its
  numbered municipal districts as the locality, because in Czech administration
  that is what they are.
  Fix: `pickCityName` in `src/location/use-current-city.ts` — see the Decision
  Log for why the rule is shaped the way it is.

- Observation: the geocoder localizes everything, not just the city. `country`
  came back as "Czechy" and `region` as "Praga" on a Polish-language simulator.
  That is the behaviour this plan wanted for the city name, and it is worth
  knowing that it extends to every field, in case one of them is ever displayed:
  none of them are stable identifiers, so none may be used as a key.

- Observation: renaming a constant across several edits leaves Fast Refresh
  holding a broken intermediate state, and it does not recover on its own. After
  the constant was renamed but before its three uses were updated, the Simulator
  went to a blank white screen and stayed there even once the file was
  consistent again.
  Evidence: `[ReferenceError: Property 'CURRENT_CITY' doesn't exist]` in
  `.expo/dev/logs/start.log`, timestamped during the edit sequence, while
  `npx tsc --noEmit` on the finished files was already clean.
  Consequence: a white screen after a multi-file edit is worth one relaunch
  before it is worth any debugging. `xcrun simctl terminate` followed by
  `xcrun simctl launch` is enough, and it does not touch Metro.

## Decision Log

- Decision: The city follows the **user's position**, not the centre of the map
  viewport.
  Rationale: Szymon's call when asked, and the design agrees.
  `app-design/v1/10-nowe-miasto.png` shows this exact card reading "NOWA MAPA /
  Praga / 0%" above a sheet that says "Jesteś pierwszy raz w Pradze" — *you are*
  in Prague, a statement about the user, not about what the screen is showing.
  The percentage next to the city name is the user's progress in that city, and
  progress is a property of a person in a place; making it follow a scroll
  gesture would mean panning to Kraków reads as "your progress reset to zero".
  Viewport-following would also need a debounce, a distance threshold, and a
  cache to avoid Apple's geocoder throttling, none of which position-following
  needs, because the position is read once per screen mount.
  Cost, stated plainly: the header does not react to panning at all. Someone who
  drags the map to another city sees the header stay put. That is the intended
  behaviour, not an oversight.
  Date/Author: 2026-08-16, Szymon (decision) / Claude (research).

- Decision: A city the catalogue has no places for shows the "NOWA MAPA" eyebrow
  and 0%, but the bottom sheet keeps its normal copy.
  Rationale: Szymon's call when asked. The eyebrow switch is two message keys and
  one conditional, and without it the card reads "TWOJA MAPA / Praga — 0%
  odkryte", which sounds like a failure rather than an invitation. The rest of
  `10-nowe-miasto.png` — the "Jesteś pierwszy raz w…" headline and the "Pokaż
  pierwsze odkrycie" button — is deliberately left out, because that button has
  nowhere to go: the recommendation flow it opens (`05-zaskocz-mnie.png`) does
  not exist. Adding it would put a second dead button on the screen next to
  "Zaskocz mnie", and dead buttons are how a prototype starts lying about what it
  can do.
  Date/Author: 2026-08-16, Szymon (decision) / Claude (implementation).

- Decision: Reverse geocoding uses `expo-location`, which on iOS is Apple's
  CLGeocoder, rather than the Mapbox Geocoding API.
  Rationale: Szymon's call when asked. `expo-location` is already a dependency at
  `~57.0.10`, already has the permission it needs, and costs nothing per call.
  The Mapbox Geocoding API is billed separately from map tiles and would add a
  second network dependency for a string we can get for free. It stays the
  escape hatch if Apple's geocoder turns out to be too slow, too throttled, or
  too coarse in Poland — the whole dependency is contained in one file,
  `src/location/use-current-city.ts`, so swapping it is a rewrite of forty lines
  and touches no screen.
  Date/Author: 2026-08-16, Szymon (decision) / Claude (research).

- Decision: `CityProgress` gains a `totalPlaces` field rather than the header
  card inferring "new city" from `percent === 0`.
  Rationale: those are different facts and will diverge. A city with six places
  and none discovered is 0% and is emphatically *not* a new map — it is a map
  you have not started. Inferring one from the other would relabel that case
  wrongly the moment the catalogue grows. `computeCityProgress` already receives
  `totalPlacesInCity` as an argument and throws it away; returning it costs one
  line and makes the distinction available to every caller.
  Date/Author: 2026-08-16, Claude.

- Decision: `discoveredCount` keeps counting every discovery rather than the ones
  in the named city, and this plan does not fix it.
  Rationale: fixing it honestly requires a `city` field on `Place`, which forces
  a product question this plan has no mandate to answer. The four fixtures are
  "Ukryty punkt widokowy" (a spoil tip), "Stary sad w Giszowcu" (Katowice),
  "Wieża ciśnień w Chorzowie" (Chorzów) and "Zalew w Dziećkowicach" (Mysłowice) —
  so two of the four are outside Katowice's administrative boundary while all
  four clearly belong to "your Katowice map". Deciding whether a city map means
  the city or the area around it changes what `PLACE_COUNT_BY_CITY` counts and
  what the 67% means, and it deserves its own plan. Meanwhile the field is not
  rendered anywhere — confirmed by `grep -rn "discoveredCount" src/`, which finds
  only its definition and its computation — so nothing on screen is wrong today.
  Date/Author: 2026-08-16, Claude.

- Decision: The city name prefers `region` over `city` when the region is the
  start of the city name, implemented as `pickCityName` in
  `src/location/use-current-city.ts`.
  Rationale: Prague reports `city: "Praga 2"` with `region: "Praga"` — see
  Surprises for the raw readings — and taking the locality blindly would make the
  app treat each municipal district as its own map. The rule fires only on that
  exact shape: the region must be followed by a space inside the city name, so
  "Śląskie" against "Katowice" and "Mazowieckie" against "Warszawa" do not match
  and Poland is untouched. It was chosen over the two alternatives it beats on
  honesty. Stripping a trailing number would be a string trick with no meaning
  behind it, and it would mangle any real place whose name ends in a digit.
  Preferring `region` outright would rename Katowice to "Śląskie".
  Limits, stated plainly: this is a heuristic verified against three positions,
  not a rule Apple documents. It is confined to one small pure function so a
  fourth surprising city means editing four lines, and the function's comment
  carries the evidence so the next person does not have to rediscover it.
  Date/Author: 2026-08-16, Claude.

- Decision: When the geocoder cannot name a position, the header falls back to
  the same `FALLBACK_CITY` constant used when there is no position at all.
  Rationale: the card must render something, and a blank city line is worse than
  a stale one. The honest cost: a user in Prague whose geocode fails sees
  "Katowice", which is a lie rather than an absence. It is accepted because the
  failure needs a working map with a broken geocoder — Apple's geocoder needs
  the network, and so do the map tiles, so in practice the map is grey before
  this matters. If it proves to happen in real use, the fix is a third state in
  `useCurrentCity` and a neutral copy string, not a cleverer fallback.
  Date/Author: 2026-08-16, Claude.

- Decision: The city is resolved once per screen mount, not continuously.
  Rationale: `useUserLocation` already reads the position exactly once and
  documents why — `04-mapa.png` centres the map when the screen opens and nothing
  on it tracks the user; following them continuously belongs to
  `07-w-drodze.png`. Layering a live geocode on a one-shot position would be
  incoherent. The consequence to know about: expo-router keeps tab screens
  mounted, so switching to Profil and back does **not** re-resolve. Crossing a
  city boundary with the app open leaves the header stale until the app is
  relaunched. Upgrading this later means `Location.watchPositionAsync` plus a
  distance threshold before re-geocoding, and it is listed in Outcomes as out of
  scope rather than forgotten.
  Date/Author: 2026-08-16, Claude.

- Decision: Apple's geocoder is allowed to localize city names, and the map is
  not.
  Rationale: CLGeocoder returns names in the device's language, so a Polish
  phone gets "Praga" — which is exactly what `10-nowe-miasto.png` shows, so the
  design and the platform agree for free. An English phone gets "Prague" while
  the map underneath draws "Praha", because the Mapbox style reads the `name`
  field and Mapbox Streets v8 has no Polish or per-device localization for it.
  That inconsistency is accepted: the header is the app speaking, and the app
  speaks the user's language. It is also the smaller half of a problem already
  recorded for the map style, whose fix is a second published style reading
  `name_en`.
  Date/Author: 2026-08-16, Claude.

## Outcomes & Retrospective

Done, and it does what the Purpose promised: the header names the city the user
is standing in, and a city the catalogue has never heard of gets the second
header state from `app-design/v1/10-nowe-miasto.png` rather than a percentage
that reads like a failure. Six files changed, one added, no new dependency, no
native configuration touched, and therefore no rebuild.

One thing was harder than the plan expected and one was easier. Harder: the
geocoder's `city` field is not reliably the city, which cost a diagnostic
round-trip and produced `pickCityName` — a function the plan did not anticipate
at all. Easier: nothing downstream needed changing. `useCityProgress` was written
against a `city` parameter rather than a constant, so its `useEffect` re-ran on
its own the moment the name changed. That is the whole payoff of a hook taking an
argument it does not yet need, collected months later by someone who did not
write it.

The retrospective worth carrying: the plan's own acceptance criterion is what
caught the defect. It said the header must read "NOWA MAPA / Praga — 0%
odkryte", and the screen said "Praga 2". Had the criterion been written loosely —
"the header shows the right city" — "Praga 2" would have passed, because it is
arguably the right city. Writing the expected string down before looking is what
made the difference between a check and a formality. `npx tsc --noEmit` and
`npx expo export` were both clean throughout, as they have been for every defect
this repository has produced so far.

Already known to be out of scope, so the next plan starts from an honest picture:

- Following the user across a city boundary while the app is open. Needs
  `watchPositionAsync` and a distance threshold; see the Decision Log.
- Per-city discovery counts. Needs a `city` field on `Place` and a decision
  about whether a city map covers the city or the area; see the Decision Log.
- The rest of `10-nowe-miasto.png`: the "Jesteś pierwszy raz w…" headline and the
  "Pokaż pierwsze odkrycie" button, which needs the recommendation flow.
- Any catalogue for a second city. Every city except Katowice will legitimately
  read 0%, because `PLACE_COUNT_BY_CITY` knows one city.

## Context and Orientation

This is an Expo SDK 57 app using expo-router, iOS only, TypeScript `strict`, with
no test suite and no configured linter. Verification is a type check, a bundle
check, and looking at the iOS Simulator.

The work touches six files and adds one. Every path below is relative to the
repository root, `/Users/szymon/Documents/projects/unmapp`.

`src/app/(tabs)/index.tsx` is the map screen and the only **route** this plan
touches — in expo-router every file under `src/app/` is a URL, and this one is
`/`, the app's first screen. No route is added, moved, or renamed, so the
navigation structure is untouched. It currently declares
`const CURRENT_CITY = 'Katowice'` above the component and uses it in three
places: as the argument to `useCityProgress`, as the `fallbackCity` prop of
`MapHeaderCard`, and as the interpolated `{{city}}` in the two location-failure
notes passed to `NearbySheet`.

`src/location/use-user-location.ts` exports `useUserLocation()`, which returns a
discriminated union — a type where a single `status` string says which of several
shapes the value has, so the compiler forces every case to be handled:

    export type UserLocation =
      | { status: 'asking' | 'denied' | 'unavailable' }
      | { status: 'granted'; coords: { latitude: number; longitude: number } };

`asking` is the first frame, `denied` means the user refused permission,
`unavailable` means they agreed but no fix arrived (the normal Simulator result
when Features > Location is "None"), and `granted` carries the position. This
file is **not modified**; the new hook consumes its output.

`src/domain/types.ts` holds the app's vocabulary. `CityProgress` is what the
header card renders and currently has `city`, `discoveredCount`, and `percent`
(0 to 1). This plan adds a fourth field.

`src/domain/progress.ts` holds pure functions — same arguments, same result, no
side effects — that turn discoveries into the numbers screens display.
`computeCityProgress(discoveries, totalPlacesInCity, city)` is the one this plan
changes, and it already guards against division by zero by returning 0% when
`totalPlacesInCity <= 0`.

`src/data/use-city-progress.ts` exports `useCityProgress(city)`, which asks the
repository for the discoveries and the city's place count, feeds both to
`computeCityProgress`, and returns `CityProgress | null` — `null` for the first
frame, because the repository is asynchronous. Its `useEffect` already depends on
`city`, so **it re-runs by itself when the city changes**. This file needs no
edit, which is the payoff of it having been written against a parameter rather
than a constant.

`src/data/in-memory-repository.ts` answers `countPlacesInCity(city)` from
`PLACE_COUNT_BY_CITY`, a `Record<string, number>` containing exactly
`{ Katowice: 6 }`, and returns `0` for anything else. That `?? 0` is what makes
every other city land in the "new map" state without any further work.

`src/components/map/MapHeaderCard.tsx` renders the card: the app's mark in an
orange circle, the eyebrow `t('map.eyebrow')`, the city-and-percentage line, and
the large percentage on the right. It takes `progress: CityProgress | null` and
`fallbackCity: string`, showing the bare city name until the number arrives.

`messages/pl.json` is the source of truth for translation keys — TypeScript
derives the allowed key set from it, so a typo in `t('map.newCityEyebro')` fails
`npx tsc --noEmit`. `messages/en.json` mirrors it; a key missing there falls back
to the Polish string at runtime. Per AGENTS.md, no string a user reads may be
written inside a component.

Two mockups define the two states, both in `app-design/v1/`. `04-mapa.png` is the
normal case: "TWOJA MAPA" over "Katowice — 63% odkryte" with the number repeated
large on the right. `10-nowe-miasto.png` is the empty case: the identical card
reading "NOWA MAPA" over "Praga", with "0%" on the right. The layout is the same;
only the eyebrow and the numbers differ, which is why this is a conditional
inside the existing component rather than a second component.

External services: Apple's geocoding service, reached through
`Location.reverseGeocodeAsync` from `expo-location` (`~57.0.10`, already in
`package.json`). It requires a network connection. Its documentation warns that
"geocoding is resource consuming and has to be used reasonably" and that too many
requests at once produce an error — this plan issues exactly one per screen
mount, so that limit is not approached. No other package is added, and
`app.config.ts` is not touched, so **there is no native configuration change and
no prebuild or rebuild is required**.

## Plan of Work

Work through the five edits in the order below. Each one type-checks on its own,
so `npx tsc --noEmit` can be run between them to keep the blast radius small.

**One.** In `src/domain/types.ts`, add a `totalPlaces: number` field to the
`CityProgress` interface, documented as how many places the catalogue knows about
in that city, with zero meaning the city is not covered yet. Adding a required
field to an interface breaks every construction site of that type, which is the
point: the compiler will now point at `computeCityProgress` as the only place
that builds one.

**Two.** In `src/domain/progress.ts`, include `totalPlaces: totalPlacesInCity` in
both objects `computeCityProgress` returns — the early return for the
zero-or-negative guard and the normal one. Do not change the existing behaviour
of either branch. Update the function's doc comment to mention the new field.

**Three.** Create `src/location/use-current-city.ts`. It exports one hook that
takes the `UserLocation` value and returns `string | null` — the city name, or
`null` while it is still being resolved or when it could not be determined. The
hook must:

  - do nothing at all unless `location.status === 'granted'`, returning `null`
    for `asking`, `denied` and `unavailable`, since there is no position to name;
  - call `Location.reverseGeocodeAsync({ latitude, longitude })` inside a
    `useEffect`, taking the `city` field of the first result;
  - fall back to `subregion` and then `region` when `city` is `null`, which is
    what Apple returns for a position in open country rather than in a town —
    `subregion` is the county (in Poland, the *powiat*) and `region` the province
    (*województwo*), so the card degrades to a wider area rather than to nothing;
  - catch any error and resolve to `null` rather than letting it escape, since a
    failed geocode must not take the map screen down with it;
  - guard against setting state after the screen is gone, with the same
    `let cancelled = false` pattern `use-user-location.ts` already uses — copy
    that shape deliberately, so the two files in `src/location/` read alike;
  - depend on the latitude and longitude **numbers** in the `useEffect`
    dependency array, not on the `coords` object, so the effect is not re-run by
    an identical object arriving with a new identity.

Write the file in the same 2-space, semicolon, single-quote style as its
neighbour `use-user-location.ts`. The repository has no Prettier configuration
and two styles are present in the tree, so the rule is to match the file you are
next to rather than to impose one.

**Four.** Add the copy. In `messages/pl.json`, inside the existing `map` object
and next to `eyebrow`, add `"newCityEyebrow": "Nowa mapa"`. Then add the same key
to `messages/en.json` with `"New map"`. Order matters only in that `pl.json` is
the source of truth for the key set: add it there first, or the type will not
exist and the English edit will not compile against it. The existing `eyebrow`
value is `"Twoja mapa"` in sentence case — the uppercase in the mockups comes
from the `eyebrow` text variant, not from the string, so do not shout in the
JSON.

**Five.** In `src/components/map/MapHeaderCard.tsx`, choose the eyebrow from the
progress rather than hardcoding it: when `progress` is non-null and its
`totalPlaces` is `0`, render `t('map.newCityEyebrow')`; otherwise render
`t('map.eyebrow')`. While `progress` is still `null` the card must show the
normal eyebrow, because guessing "new map" before the answer arrives would make
the card flicker from "NOWA MAPA" to "TWOJA MAPA" on every launch in Katowice.
Extend the component's doc comment to name `10-nowe-miasto.png` as the second
state it now implements.

**Six.** In `src/app/(tabs)/index.tsx`, rename the `CURRENT_CITY` constant to
`FALLBACK_CITY` and rewrite its comment: it is no longer "the city we are in", it
is what the card says when the position is unknown or unnamed, and it stays
Katowice because that is where the fixture data and the fallback camera already
point. Then call the new hook and let the result win when it exists:

    const location = useUserLocation();
    const city = useCurrentCity(location) ?? FALLBACK_CITY;
    const progress = useCityProgress(city);

Replace all three remaining uses of the old constant with `city`: the
`fallbackCity` prop and the two `t('map.locationDenied' | 'map.locationUnavailable',
{ city })` interpolations. Note that in both of those failure branches
`useCurrentCity` returns `null` by construction, so `city` is `FALLBACK_CITY` and
the notes read exactly as they do today — "Bez dostępu do lokalizacji mapa
pokazuje Katowice." That is correct, because in those branches the map really is
showing Katowice: `DiscoveryMap` falls back to `FALLBACK_CAMERA`, which is
centred on it.

## Concrete Steps

Run everything from `/Users/szymon/Documents/projects/unmapp`.

No installation step is needed. Confirm that before starting, rather than
assuming it:

    node -e "console.log(require('./package.json').dependencies['expo-location'])"
    # Expected: ~57.0.10

Then make the six edits described above. After each, or at least at the end:

    npx tsc --noEmit
    # Expected: no output, exit code 0.
    # If step one is done without step two, expect exactly one error:
    #   src/domain/progress.ts(23,12): error TS2739: Type '{ city: string;
    #   discoveredCount: number; percent: number; }' is missing the following
    #   properties from type 'CityProgress': totalPlaces
    # That error is the plan working — it is the compiler naming the next edit.

    npx expo export --platform ios --output-dir /tmp/unmapp-export
    # Expected: an "ios bundles (1)" line, then "Exported: /tmp/unmapp-export"

The edits are all JavaScript and TypeScript, so they reach the running app over
Fast Refresh. Do not start Metro and do not rebuild — neither is needed and
AGENTS.md forbids the first.

## Validation and Acceptance

The type check and the bundle check above are the gate, not the proof. This
repository has a documented history of both passing while the screen was wrong,
so the acceptance below is what actually decides.

Open the app on the iOS Simulator and check three scenarios in order. Changing
the simulated position does **not** update a running app, because the position is
read once per screen mount — after each change, reload the app from the developer
menu (the gear button visible over the header card) or relaunch it.

**Scenario one, a city with data.** Set Features > Location > Custom Location to
latitude `50.2649`, longitude `19.0238`. Reload. The header must read:

    TWOJA MAPA
    Katowice — 67% odkryte                                    67%

That is the behaviour that exists today, and the point of checking it first is to
prove the change did not break it. The number must be 67, not the mockup's 63:
four fixture discoveries against six catalogued places.

**Scenario two, a city with no data.** Set Custom Location to latitude `50.0755`,
longitude `14.4378` — Prague, the city `10-nowe-miasto.png` uses. Reload. The
header must read:

    NOWA MAPA
    Praga — 0% odkryte                                         0%

Expect "Praga" on a Polish-language simulator, because Apple localizes the name.
On an English-language simulator expect "Prague". If a third spelling appears,
record it in Surprises & Discoveries rather than working around it — it tells us
something about the geocoder we do not currently know. The word before it,
however, is not negotiable: "NOWA MAPA" is what proves `totalPlaces` reached the
card. A Polish city other than Katowice works equally well for this scenario;
Kraków is latitude `50.0647`, longitude `19.9450`.

**Scenario three, no position.** Set Features > Location to None, then delete the
app from the Simulator and run it again so the permission prompt returns, and
deny it. The map must stay on Katowice, the header must read "TWOJA MAPA /
Katowice — 67% odkryte", and the sheet must carry the note "Bez dostępu do
lokalizacji mapa pokazuje Katowice." Nothing may crash, and no blank city line
may appear at any point — including the first frame, before the geocode resolves.

Watch the first frame in every scenario. The card is rendered before both the
geocode and the repository answer, so it briefly shows the fallback city with no
percentage. It must never show an empty string, the word "null", or "NOWA MAPA"
flashing before the real state settles.

Two standing rules from AGENTS.md apply throughout. **Never verify on web** — it
has no native map, no safe-area insets, and no CoreLocation. **Never start
Metro** — one instance runs in the background; attach to it, and if none is
running, report that and stop.

## Idempotence and Recovery

Every edit is additive or a rename, and all six are safe to repeat: re-running
them produces the same file contents. There is no migration, no generated code,
and no native project change, so nothing can be left half-applied on disk.

If the geocode never resolves and the header sits on the fallback city forever,
work through the causes in this order. Confirm the Simulator has a position at
all (Features > Location must not be None — with None, `useUserLocation` returns
`unavailable` and the new hook correctly never runs). Confirm the Simulator has
network access, since Apple's geocoder is a network service. Then log the raw
result of `reverseGeocodeAsync` temporarily and look at whether `city` came back
`null`, which is the case the `subregion` and `region` fallbacks exist for.

If Apple's geocoder returns an error under repeated reloads, that is its
documented rate limiting. It is transient; wait a minute rather than adding a
retry loop, and if it recurs in ordinary use, record it in Surprises &
Discoveries — that evidence is what would justify moving to the Mapbox Geocoding
API, which the Decision Log keeps as the escape hatch.

To back the whole change out: `git checkout -- src messages` restores the five
edited files, and `rm src/location/use-current-city.ts` removes the new one.
Nothing else is touched, and no rebuild is needed to return to the previous
behaviour.

## Interfaces and Dependencies

No new dependencies. `expo-location` (`~57.0.10`) is already installed and
already holds foreground location permission, granted through the plugin
configuration in `app.config.ts`, which this plan does not modify.

What must exist at the end:

    // src/location/use-current-city.ts — new file
    import type { UserLocation } from '@/location/use-user-location';

    /**
     * The name of the city the user is standing in, or null while it is still
     * being worked out or could not be determined.
     */
    export function useCurrentCity(location: UserLocation): string | null;

    // src/domain/types.ts — one field added
    export interface CityProgress {
      city: string;
      discoveredCount: number;
      /** How many places the catalogue knows about here. 0 means the city is
       *  not covered yet, which is what the "new map" header state keys on. */
      totalPlaces: number;
      /** 0 to 1. */
      percent: number;
    }

The signature of `computeCityProgress` does not change — only the shape of what
it returns. `useCityProgress(city: string): CityProgress | null` does not change
at all.

Documentation that must be read before writing the code, per AGENTS.md, and not
written from memory of an older SDK:

- <https://docs.expo.dev/versions/v57.0.0/sdk/location/> — specifically
  `reverseGeocodeAsync` and the `LocationGeocodedAddress` fields. Its shape in
  SDK 57 is `city`, `country`, `district`, `formattedAddress` (Android only),
  `isoCountryCode`, `name`, `postalCode`, `region`, `street`, `streetNumber`,
  `subregion`, and `timezone` (iOS only), every one of them `string | null`.
