# Give every place a city, and count discoveries per city rather than in total

**IMPLEMENTER INSTRUCTION: Keep this plan up to date as you work.**
After each significant step, update the `Progress` section with what was done and what's next. If context is lost or you are interrupted, the plan must contain everything needed to resume. Treat the plan as the single source of truth for this work.

This ExecPlan is a living document. The sections `Progress`, `Surprises &
Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept
up to date as work proceeds.

Reference: This plan follows conventions from AGENTS.md (root) and
docs/exec-plans/create-plan-file.md.

## Purpose / Big Picture

`computeCityProgress` in `src/domain/progress.ts` reports how much of a city the
user has uncovered, and its `discoveredCount` is simply `discoveries.length` —
every discovery the user has ever made, no matter where. That was harmless while
the city was a constant, because there was only ever one city. It stopped being
harmless when the header started naming the city from the user's position: stand
in Prague today and the app computes four discoveries there, when the user has
never been.

After this change, a `CityProgress` for a city counts only the discoveries made
in that city. Prague reports zero discoveries instead of four. Katowice still
reports four, and the screen in Katowice is pixel-identical — which is the point,
and also why this plan is careful about how it proves anything happened at all.

The enabling change is one field: `Place` gains `city`, so a discovery can be
traced through its place to a city. Nothing else in the app can currently answer
"where did this happen?".

**This is an internal correctness fix.** Nothing on screen changes in Katowice,
so acceptance cannot be "look at the header". Validation and Acceptance below
specifies a temporary diagnostic log as the way to observe it, and requires that
log to be removed before the work is finished.

## Bird's Eye View

Before — the count ignores the city it is counting for:

    repository.listDiscoveries()  -> 4 fixture discoveries
    repository.countPlacesInCity("Praga") -> 0
            |
            v
    computeCityProgress(discoveries, 0, "Praga")
        discoveredCount = discoveries.length = 4     <-- wrong, and untraceable:
                                                         a Discovery knows its
                                                         placeId, and a Place has
                                                         no city to look up
        -> { city: "Praga", discoveredCount: 4, totalPlaces: 0, percent: 0 }

After — the count is filtered through the catalogue:

    repository.listDiscoveries()  -> 4 discoveries (each has a placeId)
    repository.listPlaces()       -> 4 places      (each now has a city)   <-- NEW
    repository.countPlacesInCity("Praga") -> 0
            |
            v
    computeCityProgress(discoveries, places, 0, "Praga")
        placesById  = Map placeId -> Place
        discovered  = discoveries whose place.city === "Praga"  -> 0
        -> { city: "Praga", discoveredCount: 0, totalPlaces: 0, percent: 0 }

    ...and for Katowice, where all four places live:
        discovered = 4, totalPlaces = 6 (the stand-in), percent = 0.67

What changes, at a glance:

    REMOVED                  ADDED                       UNCHANGED
    discoveries.length as    Place.city (required)       PLACE_COUNT_BY_CITY
    the count                places param on             the four fixtures
                             computeCityProgress         every screen and component
                             listPlaces() in the hook    CityProgress's field list
                                                         what the header renders

Where a single number comes from, end to end:

    Discovery { placeId: "p-wieza" }
        |
        | placesById.get("p-wieza")
        v
    Place { id: "p-wieza", name: "Wieża ciśnień w Chorzowie", city: "Katowice" }
        |                                                     ^
        | place.city === "Katowice"?  yes -> counted          |
        v                                                     |
    discoveredCount                          the field this plan adds; it means
                                             "which city map this belongs to",
                                             NOT the place's postal address

## Assumptions

The app is developed on a Mac against the iOS Simulator, and a Metro instance is
already running in the background. Per AGENTS.md the implementer attaches to it
and never starts one; if nothing is running, say so and stop.

The four fixture discoveries in `src/data/in-memory-repository.ts` all belong to
the Katowice map, so after this change the header in Katowice must still read
67% — four discoveries against the stand-in count of six. If it reads anything
else, the filter is wrong. This is the single most useful regression check in the
plan, because it is the one thing visible on screen.

No screen displays `discoveredCount` today. Confirmed with
`grep -rn "discoveredCount" src/`, which finds only its declaration in
`src/domain/types.ts` and its computation in `src/domain/progress.ts`. That is
why this plan needs a diagnostic to observe its own effect.

`computeCityProgress` has exactly one caller, `src/data/use-city-progress.ts`.
Confirmed with `grep -rn "computeCityProgress" src/`. Changing its signature is
therefore a two-file change, not a sweep.

## Open Questions

None. Both were asked and answered before this plan was written — see the
Decision Log entries on what `city` means and on where the denominator comes
from.

## Progress

- [x] (2026-08-16 23:10Z) Established from `08-odkryto.png` and
      `09-skala-eksploracji.png` what a city map actually covers, and got both
      open questions answered — see the Decision Log.
- [x] (2026-08-16 23:12Z) Plan approved by Szymon.
- [x] (2026-08-16 23:13Z) Added `city` to `Place` with the comment pinning down
      its meaning, and set `city: 'Katowice'` on all four fixtures, with an
      inline note on the Chorzów entry so the two out-of-town places read as
      deliberate.
- [x] (2026-08-16 23:14Z) `computeCityProgress` now takes `places` and counts
      only discoveries whose place belongs to the named city; dangling records
      are skipped, matching `computeCategoryCounts`.
- [x] (2026-08-16 23:14Z) `use-city-progress.ts` fetches `listPlaces()` in the
      existing `Promise.all` and passes it through.
- [x] (2026-08-16 23:15Z) `npx tsc --noEmit` exit 0 and
      `npx expo export --platform ios` exit 0.
- [x] (2026-08-16 23:17Z) Observed the fix through the temporary diagnostic at
      both positions — Katowice `discoveredCount: 4`, Prague `discoveredCount: 0`
      where it was 4 before. Evidence in Surprises.
- [x] (2026-08-16 23:18Z) Diagnostic removed; `grep -rn "\[progress\]" src/` and
      `grep -rn "console\.log" src/` both print nothing, `npx tsc --noEmit`
      still exit 0.
- [x] (2026-08-16 23:18Z) Regression check with the diagnostic gone: the Katowice
      header reads "TWOJA MAPA / Katowice — 67% odkryte" exactly as before.
      Simulator left on Katowice with location granted.
- [x] (2026-08-16 23:20Z) Moved this plan to `docs/exec-plans/completed/`.

## Surprises & Discoveries

- Observation: the fix works, and the only way to see it was the diagnostic. At
  Prague the count went from 4 to 0; at Katowice nothing moved, which is the
  intended result.
  Evidence: `[progress]` lines from `.expo/dev/logs/start.log`, one launch each.

      Katowice  {"city":"Katowice","discoveredCount":4,"totalPlaces":6,
                 "percent":0.6666666666666666}
      Praga     {"city":"Praga","discoveredCount":0,"totalPlaces":0,"percent":0}

- Observation: `useCityProgress` runs **twice per screen mount**, and the first
  run is against the fallback city. The Prague launch logged two lines, not one:

      {"city":"Katowice","discoveredCount":4,"totalPlaces":6,"percent":0.666…}
      {"city":"Praga","discoveredCount":0,"totalPlaces":0,"percent":0}

  That is the map screen rendering with `FALLBACK_CITY` before the reverse
  geocode resolves, then re-rendering with the real city — inherent to how the
  city is resolved, not a defect. It costs two repository round-trips per launch,
  which is free against in-memory fixtures and worth remembering when the
  repository becomes a network call: the first pair of requests is always thrown
  away.
  This also caused a false negative while verifying. Reading the log with
  `tail -1` after waiting for *any* new line caught the fallback entry and
  reported Prague as `{"city":"Katowice","discoveredCount":4}`, which looks
  exactly like the fix not working. Read the whole sequence for a launch, not its
  first line.

- Observation: nothing else in the codebase constructs a `Place`, so making
  `city` required cost exactly four edits. Confirmed before starting with
  `grep -rn "Place" src/`, which found only the type, the repository interface,
  the fixtures, and the two functions in `progress.ts` that take `Place[]`.
  Worth stating because it is why a required field was affordable here and would
  not be once a real catalogue, a form, or a seeded database exists.

## Decision Log

- Decision: `Place.city` means "which city map this place belongs to", not the
  place's administrative city. All four fixtures get `'Katowice'`, including
  "Wieża ciśnień w Chorzowie" and "Zalew w Dziećkowicach".
  Rationale: the design settles this, and it settles it against the intuitive
  reading. `app-design/v1/08-odkryto.png` shows the screen after discovering
  "Ukryty punkt widokowy" — a place the fixtures put 23 km away, on a spoil tip
  outside the city — and its progress bar reads "Katowice 63% → 64,2%". A place
  23 km out therefore credits Katowice, so the field cannot be an address.
  `app-design/v1/09-skala-eksploracji.png` explains why: the app measures reach
  in distance bands (Okolica 0–10 km, Region 10–50 km, Weekend 50–150 km) and
  states outright that "każde miasto ma własną mapę eksploracji". The header on
  the map screen is the label for the area around you, named after the city you
  are standing in.
  Szymon confirmed the single-field version when asked. The administrative truth
  is not lost: it is in the names the user actually reads — "Wieża ciśnień **w
  Chorzowie**". A second field (`city` plus `mapCity`) was offered and declined,
  because nothing would read the second one until `19-szczegoly-miejsca.png`
  exists.
  Risk accepted: someone unfamiliar will eventually see `city: 'Katowice'` on a
  place named "w Chorzowie" and try to fix it. The mitigation is the comment on
  the field, which states the meaning and cites the mockup.
  Date/Author: 2026-08-16, Szymon (decision) / Claude (research).

- Decision: `PLACE_COUNT_BY_CITY` stays a hardcoded stand-in; the denominator is
  not derived from `PLACES`.
  Rationale: Szymon's call when asked. Deriving it would make the data
  self-consistent but would report Katowice at 100%, because all four fixture
  places are discovered — a demo screen showing a finished game, contradicting
  the 63% in every mockup. The alternative, inventing extra undiscovered places
  to pad the catalogue, was declined because the fixtures exist to mirror the
  records visible in `app-design/v1/` and inventing content quietly breaks that
  rule. So the constant stays, and it stays honest about being a stand-in: its
  comment already says "Stand-in for how many places the catalogue knows about,
  per city."
  Consequence to keep in view: the numerator now comes from real data and the
  denominator does not, so they can disagree — with enough discoveries the
  percentage would clamp at 100% via the existing `Math.min(1, …)`. That is
  acceptable while both sides are fixtures and must be revisited when a real
  catalogue lands.
  Date/Author: 2026-08-16, Szymon (decision) / Claude (implementation).

- Decision: `computeCityProgress` takes `places` as its second parameter, giving
  `(discoveries, places, totalPlacesInCity, city)`.
  Rationale: it needs the catalogue to resolve a `placeId` into a city, and
  `computeCategoryCounts` and `computeTasteBreakdown` in the same file already
  take `(discoveries, places)` in that order. Matching them keeps the module's
  three exported functions readable as a set. The alternative — putting the city
  on `Discovery` instead — would duplicate a fact the catalogue already owns and
  would let a discovery disagree with its own place.
  Date/Author: 2026-08-16, Claude.

- Decision: A discovery whose `placeId` matches no place is skipped rather than
  counted or thrown on.
  Rationale: `computeCategoryCounts` in the same file already made this call and
  documented it — the catalogue and the journal can legitimately fall out of
  sync, and a screen should not crash over one dangling record. Counting it
  instead would put it in every city at once, which is worse than dropping it.
  Date/Author: 2026-08-16, Claude.

## Outcomes & Retrospective

Done, and it does the one thing it promised: a city's progress now counts only
the discoveries made in that city. Prague reports zero where it reported four.
Katowice is untouched at 67%, on screen and in the numbers behind it. Four files
edited, none added, no dependency and no native change, so nothing was rebuilt.

The plan's real difficulty was not the code — it was proving the code did
anything. The change is invisible by design, so "look at the Simulator" would
have accepted a completely broken filter as readily as a working one. Writing the
expected JSON down in the plan before running anything is what made the check
real, and it paid off twice: once by confirming Prague went to zero, and once by
catching a false negative when the first reading picked up the fallback frame
instead of the resolved one.

The finding worth carrying forward is not about this feature at all. Verifying
this surfaced that `useCityProgress` runs twice on every mount — once against the
fallback city, once against the geocoded one — which nobody had noticed because
both runs are instant against in-memory fixtures. That is a free observation
today and a duplicated network round-trip later, and it is now written down in
Surprises rather than waiting to be rediscovered under load.

What did not get fixed, and should be said plainly: the numerator is now real
while the denominator is still `PLACE_COUNT_BY_CITY`, a hardcoded stand-in. The
fraction is half honest. `Math.min(1, …)` keeps it from exceeding 100% when the
two halves disagree, which is a guard rail, not a resolution.

Already known to be out of scope:

- The distance bands from `09-skala-eksploracji.png` — Okolica, Region, Weekend,
  Podróże. This plan makes progress per city correct; measuring it per distance
  band is a different model and a different screen.
- A real catalogue. Both the places and the per-city totals are still fixtures
  that vanish on restart.
- Displaying `discoveredCount` anywhere. `08-odkryto.png` and
  `14-profil.png` will want it; neither is built.

## Context and Orientation

This is an Expo SDK 57 app using expo-router, iOS only, TypeScript `strict`, with
no test suite and no configured linter. Verification is a type check, a bundle
check, and looking at the iOS Simulator. Paths below are relative to the
repository root, `/Users/szymon/Documents/projects/unmapp`.

**No route changes.** Nothing under `src/app/` is added, moved, or renamed, and
`src/app/(tabs)/index.tsx` is not edited at all. **No package changes and no
native config changes**, so `app.config.ts` is untouched and no prebuild or
rebuild is needed — the edits arrive over Fast Refresh.

`src/domain/types.ts` holds the app's vocabulary. `Place` is "somewhere the app
can send the user" and currently has `id`, `name`, `summary`, `category`,
`rating`, `distanceKm`, `travelMinutes`, and `dailyVisitors`. `Discovery` is "a
record that the user visited a place" and carries a `placeId` pointing back at a
`Place`. `CityProgress` has `city`, `discoveredCount`, `totalPlaces`, and
`percent`; this plan changes how one of its fields is computed but not the
interface itself.

`src/domain/progress.ts` holds pure functions — same arguments, same result, no
side effects — that turn discoveries into displayable numbers. It exports three:
`computeCityProgress`, `computeCategoryCounts(discoveries, places)`, and
`computeTasteBreakdown(discoveries, places)`. The latter two already build a
`Map` from place id to place and already skip dangling records; the new code in
`computeCityProgress` should look like theirs rather than inventing a style.

`src/data/in-memory-repository.ts` holds the fixtures: a `PLACES` array of four
places, a `DISCOVERIES` array of four discoveries referencing all four of them,
and `PLACE_COUNT_BY_CITY`, a `Record<string, number>` equal to `{ Katowice: 6 }`
whose comment already calls it a stand-in. `countPlacesInCity` reads that record
and returns `0` for an unknown city. The four places are "Ukryty punkt widokowy"
(a spoil tip, 23 km), "Stary sad w Giszowcu" (4 km), "Wieża ciśnień w Chorzowie"
(11 km), and "Zalew w Dziećkowicach" (28 km).

`src/data/use-city-progress.ts` exports `useCityProgress(city)`. It runs a
`Promise.all` over `repository.listDiscoveries()` and
`repository.countPlacesInCity(city)`, feeds the results to `computeCityProgress`,
and returns `CityProgress | null` — `null` for the first frame. Its `useEffect`
depends on `city`, so it already re-runs when the city changes.

`src/data/discovery-repository.ts` declares the interface all of this speaks
through. It already has `listPlaces(): Promise<Place[]>`, so **no repository
method is added** — the hook simply starts calling one that already exists.

The mockups that settle the meaning of the new field are
`app-design/v1/08-odkryto.png` (a 23 km place crediting Katowice) and
`app-design/v1/09-skala-eksploracji.png` (distance bands, and "każde miasto ma
własną mapę eksploracji"). Neither screen is built.

## Plan of Work

**One.** In `src/domain/types.ts`, add a required `city: string` to `Place`. The
comment matters more than the field here, because the field's name invites the
wrong reading. State that it is the city map the place belongs to, not its
address; that a place can sit in a neighbouring town and still belong to a city's
map; and cite `08-odkryto.png` as the evidence. Making it required rather than
optional is deliberate: the compiler then points at every fixture that needs a
value, and an optional field would let a place silently belong to no map.

**Two.** In `src/data/in-memory-repository.ts`, add `city: 'Katowice'` to all
four entries of `PLACES`. Put it next to `category`, since both classify the
place rather than describe it. Leave `PLACE_COUNT_BY_CITY` exactly as it is.

**Three.** In `src/domain/progress.ts`, change `computeCityProgress` to
`(discoveries, places, totalPlacesInCity, city)` and compute the count by
filtering. Build `placesById` the same way `computeCategoryCounts` does, then
count the discoveries whose place exists and whose `place.city` equals `city`.
Skip discoveries with no matching place. Update the doc comment to say that the
count is now per city and that the total still is not, so the next reader knows
the two halves have different provenance.

**Four.** In `src/data/use-city-progress.ts`, add `repository.listPlaces()` to
the existing `Promise.all` and pass the result through as the new second
argument. The array destructuring changes from two elements to three; keep the
names accurate — `totalPlaces` is already taken by the count, so name the new one
`places`.

Nothing else changes. `MapHeaderCard`, `(tabs)/index.tsx`, the repository
interface, and every message file stay as they are.

## Concrete Steps

Run everything from `/Users/szymon/Documents/projects/unmapp`.

Make the four edits above, then:

    npx tsc --noEmit
    # Expected: no output, exit code 0.
    # Doing step one without step two should produce four errors, one per
    # fixture, each of the form:
    #   src/data/in-memory-repository.ts(17,3): error TS2741: Property 'city' is
    #   missing in type '{ id: string; name: string; ... }' but required in type
    #   'Place'.
    # Those errors are the plan working — they are the compiler listing the
    # fixtures that need a value.

    npx expo export --platform ios --output-dir /tmp/unmapp-export
    # Expected: an "ios bundles (1)" line, then "Exported: /tmp/unmapp-export"

## Validation and Acceptance

The type check and the bundle check are the gate, not the proof — in this
repository they have been clean for every defect found so far.

The difficulty specific to this plan is that **the correct outcome is an
unchanged screen**. In Katowice the header must read exactly what it reads today,
and the field that actually changes is not rendered anywhere. So acceptance has
two halves: a regression check that can be seen, and a diagnostic for the part
that cannot.

**Half one, the regression check.** With the Simulator's position set to
Katowice — Features > Location > Custom Location, latitude `50.2649`, longitude
`19.0238` — the header must read:

    TWOJA MAPA
    Katowice — 67% odkryte                                    67%

Four discoveries against the stand-in count of six. If it reads 0%, the filter is
matching nothing and the fixtures probably did not get their `city`. If it reads
anything else, the filter is matching the wrong set.

**Half two, the diagnostic.** Add this temporarily to the `load` function in
`src/data/use-city-progress.ts`, immediately before `setProgress`:

        if (__DEV__) {
          console.log('[progress]', JSON.stringify(computeCityProgress(discoveries, places, totalPlaces, city)));
        }

Then relaunch the app at each position and read the line out of
`.expo/dev/logs/start.log`, which is where the running app's console output is
recorded. Relaunching is required because the position is read once per screen
mount; `xcrun simctl terminate booted com.szymonwalach.unmapp` followed by
`xcrun simctl launch booted com.szymonwalach.unmapp` does it without touching
Metro.

At Katowice (`50.2649,19.0238`) expect:

    {"city":"Katowice","discoveredCount":4,"totalPlaces":6,"percent":0.666...}

At Prague (`50.0755,14.4378`) expect:

    {"city":"Praga","discoveredCount":0,"totalPlaces":0,"percent":0}

`discoveredCount` is the whole point: it is `4` before this change at both
positions, and `0` at Prague after it. If Prague still shows `4`, the filter is
not being applied.

**Then remove the diagnostic** and confirm it is gone with
`grep -rn "\[progress\]" src/`, which must print nothing. Re-run
`npx tsc --noEmit` afterwards. Leaving a `console.log` behind would be the
letter-of-the-law version of this plan.

Restore the Simulator to Katowice with location granted when finished, so the
next person does not inherit a device pointing at Prague.

Two standing rules from AGENTS.md apply. **Never verify on web** — it has no
native map and no CoreLocation. **Never start Metro** — one instance runs in the
background; attach to it, and if none is running, report that and stop.

## Idempotence and Recovery

All four edits are additive and safe to repeat; re-running them produces the same
file contents. There is no migration, no generated code, and no native project
change, so nothing can be left half-applied.

If the Katowice header drops to 0% after the change, the filter is matching
nothing. Check in this order: that all four fixtures actually carry
`city: 'Katowice'`; that the comparison is against `place.city` and not
`place.name`; and that `listPlaces()` is being awaited rather than passed as a
pending promise, which would produce an empty map and a count of zero without any
error.

If the header keeps its old value at every position including Prague, the hook is
probably still calling the three-argument form through a stale bundle. A white
screen or stale behaviour after a multi-file edit is worth one relaunch before it
is worth any debugging — Fast Refresh does not always recover from an
intermediate broken state.

To back the change out: `git checkout -- src` restores all four files. No new
file is created by this plan, so there is nothing to delete, and no rebuild is
needed to return to the previous behaviour.

## Interfaces and Dependencies

No new dependencies, and no new repository method — `listPlaces()` is already on
`DiscoveryRepository` in `src/data/discovery-repository.ts` and already
implemented by the in-memory repository.

What must exist at the end:

    // src/domain/types.ts
    export interface Place {
      id: string;
      name: string;
      summary: string;
      category: Category;
      /** Which city's map this place belongs to — not its address. */
      city: string;
      rating: number;
      distanceKm: number;
      travelMinutes: number;
      dailyVisitors: number;
    }

    // src/domain/progress.ts
    export function computeCityProgress(
      discoveries: Discovery[],
      places: Place[],
      totalPlacesInCity: number,
      city: string,
    ): CityProgress;

`CityProgress` is unchanged. `useCityProgress(city: string): CityProgress | null`
is unchanged. `DiscoveryRepository` is unchanged.
