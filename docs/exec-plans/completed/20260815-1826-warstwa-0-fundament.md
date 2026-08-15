# Build the Unmapp design foundation: tokens, type, primitives, and the discovery data model

**IMPLEMENTER INSTRUCTION: Keep this plan up to date as you work.**
After each significant step, update the `Progress` section with what was done and what's next. If context is lost or you are interrupted, the plan must contain everything needed to resume. Treat the plan as the single source of truth for this work.

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept
up to date as work proceeds.

Reference: This plan follows conventions from AGENTS.md (root) and
docs/exec-plans/create-plan-file.md.

## Purpose / Big Picture

Unmapp is a discovery app. The user says how much time they have, how they are
travelling, and what they feel like; the app proposes one place they have never
been; they go there and mark it discovered, which raises the percentage of their
city that is "uncovered" and earns experience points.

Twenty-two screens are designed as PNG mockups in `app-design/v1/`. None of them are
built yet. `src/app/` currently contains exactly two files: a root navigator and
a placeholder screen that says "Edit src/app/index.tsx to edit this screen."

Almost every one of those twenty-two screens is a rendering of the same handful
of visual parts (a cream screen, a white card, a pill-shaped chip, an orange
pill button, a thin progress bar, a numeric stat tile) filled with the same
underlying data (a list of places the user discovered, and numbers computed from
that list). If screens get built before those parts exist, each screen invents
its own spacing, its own shade of orange, and its own idea of what a "discovery"
is, and all of them get rewritten later.

This plan builds that shared foundation and nothing else. It does not build a
map, does not ask for location, does not call any network, and does not write
anything to disk. Those belong to later work.

After this plan is done, a developer can run the app, navigate to a screen at
`/design-system`, and see every colour, every text style, every interactive
component in each of its states, and a list of real discovery records rendered
with those components. That screen is the proof: from then on, building
`04-mapa.png` or `15-dziennik.png` is assembly rather than invention.

The term **primitive** in this plan means a small reusable React component with
no knowledge of the app's features — for example a chip that can be selected or
not. The term **token** means a single named design value, such as the exact
orange used for buttons. The term **repository** means an object that hands back
domain data through a fixed set of methods, so that the code asking for data does
not know or care whether it came from memory, a database, or a server.

## Bird's Eye View

Current state. Two route files, no shared anything:

```
src/
  app/
    _layout.tsx     <- <Stack />, nothing else
    index.tsx       <- placeholder text, inline StyleSheet, hardcoded colours

Every colour, size, and font decision would be made per screen.
```

State after this plan:

```
src/
  design/
    tokens.ts       <- colours, spacing, radii, type scale  (single source)
    fonts.ts        <- font loading + family names
  components/
    Text.tsx        <- typography-aware text
    Screen.tsx      <- cream background + safe area
    Card.tsx        Chip.tsx      PillButton.tsx
    ProgressBar.tsx StatTile.tsx  ListRow.tsx
    Mark.tsx        <- the logo, doubling as a progress indicator
  domain/
    types.ts        <- Place, Discovery, Mission, CityProgress, enums
    progress.ts     <- pure functions: discoveries -> percentages and counts
  data/
    discovery-repository.ts   <- the interface
    in-memory-repository.ts   <- fixture-backed implementation
  app/
    _layout.tsx     <- now also loads fonts and holds the splash screen
    index.tsx       <- rebuilt on the primitives, links to /design-system
    design-system.tsx  <- NEW dev route that renders everything above
```

Data flow introduced by this plan. Note that nothing crosses a network boundary
and nothing is written to disk:

```
fixtures (hardcoded array in in-memory-repository.ts)
    |
    v
DiscoveryRepository.listDiscoveries()      <- interface, swappable later
    |
    v
progress.ts: computeCityProgress(discoveries)
    |            computeCategoryBreakdown(discoveries)
    v
design-system.tsx renders the results using
Card / ListRow / ProgressBar / StatTile / Mark

Later work replaces only the first two boxes with SQLite and a server.
Nothing above them changes.
```

What this plan removes, adds, and leaves alone:

```
REMOVED    the placeholder body of src/app/index.tsx. It was originally going
           to be left alone, but it needed a way into /design-system, so it
           was rebuilt on the primitives — which also makes it a second,
           independent check that they compose.
ADDED      src/design/, src/components/, src/domain/, src/data/,
           one new route file, two font families, zero npm dependencies
           beyond the fonts themselves.
UNCHANGED  app.json, tsconfig.json, the router setup, every existing route.
```

## Assumptions

These are working assumptions that unblock the plan. Each must be either
confirmed into the Decision Log or removed before this plan is closed.

Layer 0 contains no map rendering, no location permission, no network call, and
no persistence to disk. Every number shown on `/design-system` comes from a
hardcoded fixture array. This is deliberate: it lets the whole visual foundation
be built and reviewed before committing to a map provider or a backend, both of
which are expensive to change later.

Styling is done with React Native's built-in `StyleSheet` plus a plain
TypeScript tokens module. No CSS-in-JS library and no Tailwind/NativeWind. See
the Decision Log for why.

The app is Polish-language only for now. This matters for font selection: every
chosen family must contain the glyphs ą ć ę ł ń ó ś ź ż and their capitals. A
font missing these will silently fall back to a system face mid-word, which
looks broken.

The mockups in `app-design/v1/` are the authority on appearance. Design versions
are whole sets kept side by side, so a later `app-design/v2/` would not replace
`v1` — this plan stays pinned to `v1` and would be superseded rather than edited.
Where this plan states a pixel value that was estimated by eye rather than
sampled, it says so.

## Open Questions

None block this plan; both blocking questions were resolved at closeout and moved
to the Decision Log. One question is carried forward for whoever next touches the
mark:

1. **Where does the fog dot rest at the extremes?** (affects: `Mark.tsx`.) At
   `progress` 1 the dot sits on the bottom edge of the circle, and at 0 it sits
   on the top edge. Both are legible but neither appears in
   `app-design/v1/00b-logo.png`, which only shows the resting half-covered
   state. A design answer would refine the dot's travel range.

## Progress

- [x] (2026-08-15 18:52Z) Milestone 1: tokens, fonts, and the `/design-system` route showing colour swatches and the type ramp. Installed `@expo-google-fonts/playfair-display` and `@expo-google-fonts/poppins`; created `src/design/fonts.ts` and `src/design/tokens.ts`; wired font loading and splash-screen holding into `src/app/_layout.tsx`; created `src/app/design-system.tsx`. Verified on the web target: all twelve swatches render with correct hex values and all six type roles render the Polish pangram with no fallback face.
- [x] (2026-08-15 19:14Z) Milestone 2: the primitives. Created `src/components/` with `Text`, `Screen`, `Card` (surface/ink/accentSoft tones plus a `cardTextColor` map), `Chip`, `PillButton` (primary/secondary/disabled), `ProgressBar` (overridable track for dark surfaces), `StatTile`, and `ListRow` (card and grouped appearances, destructive variant). All rendered in every state on `/design-system`. Chip toggling verified by dispatching a click on the web target and confirming the background changed from transparent to accent.
- [x] (2026-08-15 19:22Z) Milestone 3: the `Mark` component, drawn with plain views — a clipped circle, a fog rectangle whose height follows `progress`, and a dot resting on the fog line. No SVG dependency was needed. Rendered at 0%, 63%, and 100%, and in all three lockup tones from `app-design/v1/00b-logo.png`.
- [x] (2026-08-15 19:34Z) Milestone 4: `src/domain/types.ts` (Category, Transport, TimeBudget, Place, Discovery, Mission, CityProgress), `src/domain/progress.ts` (three pure derivation functions), `src/data/discovery-repository.ts` (the interface), and `src/data/in-memory-repository.ts` (fixtures mirroring the records in `app-design/v1/15-dziennik.png`). `/design-system` renders four real discoveries with derived stat tiles and a derived taste breakdown.
- [x] (2026-08-15 19:15Z) Re-verified all four milestones on the iOS Simulator (iPhone 17), attaching to the Metro instance already running rather than starting one. Confirmed on device: all twelve colour swatches; all six type roles rendering the Polish pangram in the intended faces with no fallback; the Mark at 0%, 63%, and 100% and in all three lockup tones; all three card tones; chip toggling by tapping "historia" and watching it fill; primary, secondary, and disabled buttons; progress bars at four values; stat tiles in the two-column grid with no mid-word breaks; card and grouped list rows including the destructive red; and the repository section deriving "2 natura / 1 architektura / 1 miejsca nietypowe" and a 50/25/25 taste breakdown from four fixture records.
- [x] (2026-08-15 19:12Z) Rebuilt `src/app/index.tsx` on the primitives with a "Design system" button routing to `/design-system`, so the screen can be reached by hand. Verified the navigation on the Simulator.
- [x] (2026-08-15 19:25Z) Font families confirmed at closeout. Open Question 1 resolved — see the Decision Log.
- [x] (2026-08-15 19:25Z) Removed `src/app/design-system.tsx` and the button that reached it from `src/app/index.tsx`, now that the screen has served its purpose as the acceptance artifact. `src/app/` is back to two routes. Verified after removal: typecheck clean, iOS bundle exports, and the running app renders the home screen with no dangling navigation or error screen.

## Surprises & Discoveries

- Observation: the palette was sampled directly from the mockup PNGs rather than
  estimated, so the values in `tokens.ts` are exact.
  Evidence: dominant-colour sampling over
  `01-powitanie.png`, `02-zainteresowania.png`, `04-mapa.png`, `13-misje.png`,
  `14-profil.png`, `18-ustawienia.png`, `19-szczegoly-miejsca.png` produced a
  consistent set: background `#F7F4EE`, card `#FFFDF8`, ink `#17150F`, accent
  `#FFAD5F`, soft accent `#FFDFC0`, muted text `#8A8071`, hairline `#E5E3DD`,
  danger `#9A3B2C`.
- Observation: the type ramp needed six roles, not the five this plan first
  named. A `caption` role was missing — the muted metadata line under a list
  entry ("8 sierpnia · 23 km · nietypowe" in `15-dziennik.png`) is smaller than
  `body` and uses the muted colour rather than the secondary one, so reusing
  `body` for it would have been wrong everywhere it appears.
  Evidence: `src/design/tokens.ts` now exports display, title, body, label,
  caption, and eyebrow.
- Observation: `<Stack />` renders a default white header showing the route
  name, so `/design-system` displays a "design-system" title bar above the cream
  page. Harmless for a developer screen, but every real screen in
  `app-design/v1/` is full-bleed with no such bar, so the first real screen will
  need the header disabled in `src/app/_layout.tsx`.
  Evidence: web screenshot at 375x812 shows the bar above the page content.
- Observation: the `Mark` did not need `react-native-svg`. A circle with
  `overflow: 'hidden'`, an absolutely positioned fog rectangle, and a dot
  positioned by `bottom: fogHeight` reproduce the lockups closely enough that
  the dependency was avoided.
  Evidence: `src/components/Mark.tsx` is 100 lines of plain views, and the three
  rendered tones match `app-design/v1/00b-logo.png`.
- Observation: `StatTile` breaks long labels mid-word when more than two tiles
  share a row — "miejsca nietypowe" wrapped as "miejsc / a nietyp / owe" at
  three per row. `app-design/v1/14-profil.png` uses a two-column grid, which is
  why: the design already solved this and the demo had drifted from it.
  Evidence: fixed by chunking tiles into rows of two in
  `src/app/design-system.tsx`; the same constraint applies to the real profile
  screen.
- Observation: `accessibilityState={{ selected }}` on a `Pressable` with
  `accessibilityRole="button"` produced no `aria-selected` attribute in a web
  render. Recorded for completeness only — web is out of scope for this repo, so
  this is not worth acting on. Whether VoiceOver announces chip selection on iOS
  is the question that actually matters, and it is untested.
  Evidence: querying `[role="button"]` on `/design-system` returned
  `aria-selected: null` for a chip whose background was the accent colour.
- Observation: on the Simulator the `Mark` shows a faint light hairline along the
  bottom inside edge of the circle when the fog is deep (visible at 0% and 63%,
  gone at 100%). The fog rectangle's square corners do not quite meet the
  circle's curved border, and iOS antialiases the seam.
  Evidence: Simulator screenshots of the Sygnet section at 0% and 63%. Cosmetic
  at 64pt and invisible at the 44pt size used in the city progress card, so it
  was left alone — but at larger sizes, or if the mark is ever used as a hero
  element, the fog needs to be a circle-clipped shape rather than a rectangle.

## Decision Log

- Decision: Use `StyleSheet` and a plain tokens module rather than NativeWind or
  another Tailwind-for-React-Native layer.
  Rationale: adding Tailwind is a stack-level commitment that changes how every
  future contributor writes every component, and it was not asked for. A tokens
  module gives the same single-source-of-truth benefit with no dependency, no
  build-step change, and no lock-in — and it does not prevent adopting NativeWind
  later, since the tokens would become its theme values.
  Date/Author: 2026-08-15, planning session.
- Decision: Ship an in-memory repository behind an interface instead of choosing
  a database now.
  Rationale: the screens need data shaped correctly far sooner than they need
  data that survives an app restart. Putting an interface in front means the
  SQLite-versus-MMKV decision can be made in Layer 3 by writing one new file,
  with no change to any screen.
  Date/Author: 2026-08-15, planning session.
- Decision: Build the foundation before any of the twenty-two screens, including
  before the four screens that form the core loop.
  Rationale: those four screens share every primitive in this plan. Building them
  first means building the primitives anyway, but inconsistently and without a
  place to review them side by side.
  Date/Author: 2026-08-15, planning session.
- Decision: Proceeded with Playfair Display and Poppins (Open Question 1) rather
  than waiting for an answer.
  Rationale: both render the full Polish glyph set correctly, verified on the web
  target with the pangram `Zażółć gęślą jaźń — ĄĆĘŁŃÓŚŹŻ` and no fallback face.
  Blocking milestone 1 on a font answer would have blocked everything after it.
  Swapping families later touches only `src/design/fonts.ts`, since every
  component reads families through the `typography` tokens. Open Question 1
  stays open until the design source is confirmed.
  Date/Author: 2026-08-15, implementation.
- Decision: Pinned `"userInterfaceStyle": "light"` in `app.json` (Open Question 2).
  Rationale: the tokens are a single light palette, so app content does not
  change with the system theme either way — but native chrome does. Left on
  `"automatic"`, a device in dark mode would draw a dark navigation header and
  dark keyboards against cream content. Pinning makes the native chrome agree
  with what was actually built. This is a native config change: an existing
  development build must be rebuilt to pick it up. Reversing it means changing
  one string and reshaping `tokens.ts` into a light/dark pair.
  Date/Author: 2026-08-15, implementation.
- Decision: Confirmed Playfair Display and Poppins as the app's faces, closing
  Open Question 1. They are no longer stand-ins.
  Rationale: reviewed on the iOS Simulator across all six type roles and
  accepted. If they are ever replaced, the swap touches `src/design/fonts.ts`
  only, because no component names a family directly — every one reads it
  through the `typography` tokens.
  Date/Author: 2026-08-15, closeout.
- Decision: Deleted `src/app/design-system.tsx` rather than gating it behind a
  development flag, which also closes the question of whether it ships.
  Rationale: it existed to prove the foundation, and it did — component by
  component, on the Simulator. Keeping it would mean carrying a screen that has
  to be updated with every token and primitive change, or that silently rots
  into a misleading picture of the system. The Validation section below preserves
  what it showed and how it was checked, so the evidence outlives the file. If a
  component gallery is wanted again later, rebuilding it from the primitives is a
  short job.
  Date/Author: 2026-08-15, closeout.

## Outcomes & Retrospective

All four milestones are implemented and verified on the iOS Simulator. The
foundation exists: one file defines every colour, spacing, radius, and type
role; eight primitives cover every visual part that recurs across the
twenty-two mockups; the logo is a live component whose fog level follows
discovery progress; and a typed domain model with pure derivation functions sits
behind a repository interface. It typechecks and the iOS bundle exports cleanly.

An earlier round of verification was done on the web target and had to be
redone, because this repo does not accept a web render as proof. Nothing in the
code changed as a result — every check passed again on device — but the episode
is why the Validation section now says so explicitly.

Measured against the original purpose — "building `04-mapa.png` or
`15-dziennik.png` is assembly rather than invention" — the evidence is that
`/design-system` assembles a working fragment of `15-dziennik.png` (a journal
list with dates, distances, and categories) and of `04-mapa.png` (the city
progress header with the mark and percentage) out of primitives with no
screen-specific styling, and that `src/app/index.tsx` was rebuilt on those same
primitives in a few minutes as a side errand. Two screens, no new styling.

Nothing remains. The fonts were confirmed at closeout, and the acceptance screen
was deleted once it had done its job — `src/app/` is back to two routes, and the
foundation lives entirely in `src/design/`, `src/components/`, `src/domain/`, and
`src/data/`, where no screen has to know it exists.

Note for anyone reading this later: `/design-system` no longer exists. The
Validation section below describes it in the present tense because that is what
was actually built and checked. Do not go looking for the file.

Two things went better than planned. The `Mark` needed no SVG dependency, so
the foundation still adds only the two font packages. And sampling the palette
from the PNGs rather than estimating it meant zero colour rework: the values
went into `tokens.ts` once and matched on first render.

One thing to carry forward: the mockups show only populated happy paths, and
that gap showed up immediately — `ProgressBar` needed an overridable track
colour the moment it was placed on the dark card, and `PillButton` needed a
disabled state that appears in no mockup. Later plans should assume every
component needs at least one state the design does not show.

## Context and Orientation

The reader is assumed to know nothing about this repository.

`unmapp` is an Expo SDK 57 application using expo-router, targeting iOS,
Android, and web from one codebase. **expo-router** means that files under
`src/app/` are automatically turned into navigable screens, where the file's
path becomes the screen's URL: `src/app/index.tsx` is the screen at `/`, and a
new file `src/app/design-system.tsx` becomes the screen at `/design-system`
without any registration step. Because of this, nothing that is not a screen may
be placed under `src/app/` — helper modules there would become accidental routes.

The two existing route files are small. `src/app/_layout.tsx` returns
`<Stack />` from expo-router, which is the container that stacks screens on top
of one another. `src/app/index.tsx` renders centred placeholder text.

TypeScript runs in `strict` mode. Two path aliases are configured in
`tsconfig.json`: `@/*` resolves to `src/*`, and `@/assets/*` resolves to
`assets/*`. Import with `@/design/tokens`, never with `../../design/tokens`.

Native configuration lives in `app.json`. There are no `ios/` or `android/`
directories in this repository; they are generated on demand by
`npx expo prebuild` and are gitignored. Changing `app.json` is how native
behaviour is changed.

Critically: **Expo SDK 57 differs from earlier versions in API names, config
keys, and package names.** Before writing any Expo or React Native code, consult
[https://docs.expo.dev/versions/v57.0.0/](https://docs.expo.dev/versions/v57.0.0/). Do not rely on recalled knowledge of
SDK 50-something, and treat sample code from the `building-native-ui` skill as a
candidate to verify rather than a fact, because that skill targets SDK 55.

The design mockups live in `app-design/v1/` as twenty-two PNGs named
`NN-nazwa.png`. The `v1` directory is a whole design version; later versions
arrive as sibling directories rather than overwriting it. This plan is written
against `v1` and every mockup reference below is relative to that directory. The
ones that matter most here are `00b-logo.png` (which explains the logo's dual
role), `02-zainteresowania.png` (chips), `13-misje.png` (dark card and
soft-accent card), `14-profil.png` (stat tiles and labelled progress bars),
`15-dziennik.png` (list rows), and `18-ustawienia.png` (grouped settings rows and
the destructive red).

Packages already present and relevant: `expo-font` for loading fonts,
`expo-splash-screen` for holding the launch screen while fonts load,
`expo-image` for images, `expo-symbols` for iconography,
`react-native-safe-area-context` for avoiding the notch and home indicator, and
`react-native-reanimated` for animation. Nothing needs to be installed except
the two font packages.

No test framework is installed and no linter is configured. Acceptance for this
plan is therefore a type check, a bundle check, and a human looking at
`/design-system` on a real target.

## Plan of Work

### Milestone 1: tokens, fonts, and a route to see them on

At the end of this milestone the app has one file that defines every design
value, both fonts render Polish text correctly, and there is a screen that
proves it.

Install the two font families. These are Expo's packaged Google Fonts, so they
need no asset files of your own and no `app.json` change:

```
npx expo install @expo-google-fonts/playfair-display @expo-google-fonts/poppins
```

Create `src/design/tokens.ts`. It exports one frozen object per category. The
colour values below were sampled from the mockups and are exact; the spacing and
radius values were estimated from the mockups and may be adjusted once the first
real screen is built.

```
export const colors = {
  background: '#F7F4EE',   // page background, every screen
  surface:    '#FFFDF8',   // white cards on that background
  ink:        '#17150F',   // primary text, and the dark card in 13-misje
  accent:     '#FFAD5F',   // primary buttons, selected chips, progress fill
  accentSoft: '#FFDFC0',   // the "Discovery Challenge" card in 13-misje
  textMuted:  '#8A8071',   // secondary text, captions, eyebrow labels
  textSecondary: '#5C5548',// unselected chip labels
  border:     '#E5E3DD',   // hairlines, unselected chip outlines
  track:      '#E5E3DD',   // unfilled part of a progress bar
  danger:     '#9A3B2C',   // "Usuń konto" in 18-ustawienia
  mapHalo:    '#CFDCC0',   // the green glow around the user's position
  locationDot:'#488ACB',   // the blue position dot
} as const

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const

export const radius = { tile: 16, card: 20, pill: 999 } as const
```

Create `src/design/fonts.ts`. It exports the family-name constants used by
`tokens.ts` and a hook that reports whether fonts have finished loading. Two
weights of the sans are needed (regular for body, semibold for buttons and
emphasis); one weight of the serif is enough, since it appears only at display
sizes.

Add a `typography` export to `tokens.ts` describing the ramp seen in the
mockups. There are five distinct roles: a display serif for screen headlines
(`19-szczegoly-miejsca.png`, `13-misje.png`), a smaller serif for card headlines,
a sans body, a sans label used on buttons and chips, and a small uppercase
letter-spaced sans used for the eyebrow labels ("ZASIĘG", "DZIENNIK", "KROK 1 Z 3").

Wire font loading into `src/app/_layout.tsx`. Until fonts are ready the app must
keep the splash screen visible rather than rendering text in a fallback face and
then reflowing. `expo-splash-screen` provides the calls to prevent the splash
from auto-hiding and to hide it once loading completes — check the SDK 57
documentation for the current function names before writing this.

Create `src/app/design-system.tsx`. For this milestone it renders a scrolling
page with one labelled swatch per colour token and one line of Polish sample
text per typography role. Use the string `Zażółć gęślą jaźń — ĄĆĘŁŃÓŚŹŻ` as the
sample, because it contains every Polish diacritic; if any glyph renders in a
visibly different face, the font does not cover Polish and must be replaced.

Acceptance for milestone 1:

```
npx tsc --noEmit
# Expected: no output, exit code 0

npm run ios
# Navigate to /design-system. Expected: swatches match the mockups, and
# the sample string renders with all diacritics in the intended faces.
```

### Milestone 2: the primitives

At the end of this milestone every reusable visual part exists and is visible in
all of its states on one screen.

Create these in `src/components/`, each in its own file:

`Screen.tsx` wraps a screen's contents with the cream background and safe-area
padding, so no screen repeats that.

`Text.tsx` takes a `variant` naming one of the typography roles and applies the
matching family, size, weight, and colour. Every piece of text in the app goes
through this, so a typography change is a one-file change.

`Card.tsx` is the white rounded surface used across `04-mapa.png`,
`06-rekomendacja.png`, and `14-profil.png`. It needs a `tone` of `surface`
(white), `ink` (the dark card in `13-misje.png`), or `accentSoft` (the challenge
card in the same mockup), because all three appear with identical geometry and
different colours.

`Chip.tsx` is the pill from `02-zainteresowania.png` and `05-zaskocz-mnie.png`,
with a selected state (accent fill, ink text) and an unselected state
(transparent fill, border outline, secondary text). Chips wrap onto multiple
lines and size to their content.

`PillButton.tsx` covers the primary action ("Zaczynamy", "Znajdź mi coś nowego")
and the secondary outlined variant that sits beside it ("Filtry", "Inne",
"Nawigacja"). It needs a disabled state, which appears in no mockup but will be
needed the moment a real network call exists.

`ProgressBar.tsx` is the thin rounded bar from `08-odkryto.png` and
`14-profil.png`, taking a value from 0 to 1. It appears on both light and dark
backgrounds, so the track colour must be overridable.

`StatTile.tsx` is the number-over-label tile from `14-profil.png`, where the
number uses the serif and the label the muted sans.

`ListRow.tsx` covers the journal entries in `15-dziennik.png` and the settings
rows in `18-ustawienia.png`: an optional leading thumbnail, a title, an optional
subtitle, and an optional trailing value or switch.

Extend `src/app/design-system.tsx` to render each of these under a heading, in
every state. Selected and unselected chips. Primary, secondary, and disabled
buttons. All three card tones. Progress bars at nought, part-way, and full, on
both light and dark backgrounds.

Acceptance for milestone 2:

```
npx tsc --noEmit
# Expected: no output, exit code 0

npm run ios
# Navigate to /design-system. Every component appears in every state and
# matches its counterpart in app-design/v1/. Tapping a chip toggles it.
```

### Milestone 3: the Mark

`00b-logo.png` states that the logo is a map circle half-covered by fog, and that
the same shape works as a progress indicator: the higher the discovery
percentage, the lower the fog layer sits. That makes it a component, not an image
asset.

Create `src/components/Mark.tsx` taking a `size` in points and a `progress` from
0 to 1, where 0 draws the fog covering the circle almost entirely and 1 draws it
almost fully cleared. It also takes a `tone` for the three lockups shown in the
mockup: cream background with dark fog, dark background with cream fog, and
accent background with dark fog.

Draw it with plain React Native views — a circle with `overflow: 'hidden'`, an
absolutely positioned fog rectangle whose vertical offset is driven by
`progress`, and the small accent dot. This avoids adding an SVG dependency for
one shape. If the curved fog edge visible in the mockup cannot be achieved
acceptably this way, record that in Surprises & Discoveries and add
`react-native-svg` — but try the simpler route first.

Render it on `/design-system` at 0%, 63% (the value used throughout the
mockups), and 100%, in all three tones.

Acceptance for milestone 3:

```
npx tsc --noEmit
npm run ios
# Navigate to /design-system. Three marks, visibly different fog levels,
# matching the lockups in app-design/v1/00b-logo.png.
```

### Milestone 4: the domain model

At the end of this milestone the app has a typed vocabulary for its data, pure
functions that derive every statistic the mockups display, and a source of that
data that later work can replace without touching a screen.

Create `src/domain/types.ts`. The categories are fixed by
`02-zainteresowania.png`: natura, historia, architektura, jedzenie, fotografia,
miejsca nietypowe, aktywność. The transport modes are fixed by
`05-zaskocz-mnie.png`: pieszo, rower, auto, komunikacja. The time budgets are
fixed by the same mockup: 30 minut, 1 godzina, 2 godziny, pół dnia. Model each as
a string union rather than a loose `string`, so that a typo becomes a compile
error.

A `Place` carries what `19-szczegoly-miejsca.png` and `06-rekomendacja.png`
display: identifier, name, one-line summary, category, rating, distance in
kilometres, travel time in minutes, and a daily visitor estimate (the mockups
lean on "fewer than 40 people a day" as the reason a place is worth seeing).

A `Discovery` records that the user visited a place: its own identifier, the
place identifier, a timestamp, an optional note, an optional photo reference, and
whether it is a favourite. `15-dziennik.png` filters on favourites and on having
a photo, so both must be representable.

A `Mission` carries what `13-misje.png` shows: title, description, experience
points, progress as a completed count out of a total, an optional expiry, and
whether it is the active one.

Create `src/domain/progress.ts` with pure functions — no input other than their
arguments, no side effects — that compute what the mockups display: the city
discovery percentage, the total discovery count, the count per category that
feeds the stat tiles, and the taste breakdown that feeds the five labelled bars
on `14-profil.png`. Keeping these pure means they stay correct when the data
source changes.

Create `src/data/discovery-repository.ts` declaring the interface, and
`src/data/in-memory-repository.ts` implementing it over a hardcoded fixture
array. Seed the fixtures with the records visible in the mockups — Ukryty punkt
widokowy, Stary sad w Giszowcu, Wieża ciśnień w Chorzowie, Zalew w Dziećkowicach
— so that `/design-system` looks like the design rather than like lorem ipsum.

Extend `/design-system` with a final section that pulls discoveries from the
repository, runs them through the progress functions, and renders the result
using `ListRow`, `StatTile`, and `ProgressBar`. This is the moment the two halves
of this plan meet.

Acceptance for milestone 4:

```
npx tsc --noEmit
npm run ios
# Navigate to /design-system, scroll to the bottom. A list of four real
# discoveries renders with thumbnails, dates, distances, and categories,
# above stat tiles and a taste breakdown whose numbers are derived from
# that same list.
```

## Concrete Steps

Run everything from the repository root, `/Users/szymon/Documents/projects/unmapp`.

```
npx expo install @expo-google-fonts/playfair-display @expo-google-fonts/poppins
# Expected: package.json gains both entries at SDK-57-compatible versions.
# Use `npx expo install`, not `npm install`, so versions match the SDK.

npx tsc --noEmit
# Expected: no output, exit code 0. Any output is a real error — do not
# silence it with `any` or `@ts-ignore`; the repo is strict on purpose.

npx expo export --platform ios --output-dir /tmp/unmapp-export
# Expected: an "ios bundles" line naming a .hbc file, then
# "Exported: /tmp/unmapp-export". This command proves every import and
# route resolves, which the type checker alone does not.
```

If open question 2 is answered "light only", pin it so the operating system's
dark setting cannot invert the palette. In `app.json`, change
`"userInterfaceStyle": "automatic"` to `"light"`. This is a native configuration
change: if a development build already exists it must be rebuilt for the change
to take effect.

## Validation and Acceptance

The repository has no test suite, so acceptance is a type check, a bundle check,
and a human comparing the screen against the mockups.

```
npx tsc --noEmit
# Success: no output. Failure: a list of file:line type errors.

npx expo export --platform ios --output-dir /tmp/unmapp-export
# Success: an "ios bundles" line, then "Exported: /tmp/unmapp-export".
# Failure: a Metro bundling error naming the unresolved import.
```

Then open the app **on the iOS Simulator** and navigate to `/design-system`. Do
not start the app to do this — a Metro instance is kept running in the
background; attach to it. If nothing is running, report that and stop.

The plan is complete when all of the following are true on that screen. Every
colour token appears as a labelled swatch and matches the corresponding area of
the mockups. The Polish sample string renders with every diacritic in the
intended face, with no mid-word fallback. Every primitive appears in every state
described in milestone 2. The Mark appears at three progress values and three
tones. A list of real discovery records renders, with stat tiles and a taste
breakdown computed from that same list rather than hardcoded.

Do not check the web target. iOS is the only target for now, and a web check
would not exercise native text metrics, safe-area insets, or the splash-screen
handoff — which is exactly where this plan's risk sits.

`npm run lint` is deliberately not part of acceptance: `expo lint` installs and
configures ESLint interactively on first run and is not yet set up in this
repository.

## Idempotence and Recovery

Every step is additive. With the single exception of `src/app/_layout.tsx`, which
gains font loading, this plan only creates files. `src/app/index.tsx` is not
touched. Re-running `npx expo install` for packages already present is safe and
leaves `package.json` unchanged.

If font loading is wired incorrectly the app may hang on the splash screen,
which looks like a crash but is not. Recovery: comment out the font-loading
guard in `src/app/_layout.tsx` so the app renders with system faces, confirm the
rest of the screen works, then fix the loading logic.

If a milestone is abandoned partway, the work still type-checks as long as the
new files are internally consistent, because nothing outside `src/design`,
`src/components`, `src/domain`, `src/data`, and the new route imports them.
Deleting those directories and the new route file returns the repository exactly
to its current state.

## Artifacts and Notes

The palette was sampled programmatically from the mockups rather than read off by
eye. The dominant colours over the button area of `01-powitanie.png`:

```
#F7F4EE   8078 px    background
#FFAD5F   6483 px    accent (the "Zaczynamy" button)
#17150F    121 px    ink (the button label)
#8A8071     49 px    muted text ("Mam już konto")
```

Over the dark mission card in `13-misje.png`:

```
#17150F  14078 px    ink card fill
#B4B2AC    236 px    body text on ink
#F7F4EE    112 px    headline text on ink
```

That the same `#17150F` serves as both the primary text colour and the dark card
fill, and that `#F7F4EE` serves as both the page background and text on that dark
card, is why `Card.tsx` takes a `tone` rather than each dark card restating its
colours.

## Interfaces and Dependencies

New runtime dependencies: `@expo-google-fonts/playfair-display` and
`@expo-google-fonts/poppins`, both installed through `npx expo install`. No
others. Specifically, do not add a styling library, a state management library,
an icon library (`expo-symbols` is already present), or `react-native-svg`
unless milestone 3 proves it necessary.

These types must exist at the end of milestone 4, in `src/domain/types.ts`:

```
export type Category =
  | 'natura' | 'historia' | 'architektura' | 'jedzenie'
  | 'fotografia' | 'nietypowe' | 'aktywnosc'

export type Transport = 'pieszo' | 'rower' | 'auto' | 'komunikacja'

export type TimeBudget = '30min' | '1h' | '2h' | 'polDnia'

export interface Place {
  id: string
  name: string
  summary: string
  category: Category
  rating: number
  distanceKm: number
  travelMinutes: number
  dailyVisitors: number
}

export interface Discovery {
  id: string
  placeId: string
  discoveredAt: string   // ISO 8601
  note?: string
  photoUri?: string
  favorite: boolean
}
```

This interface must exist in `src/data/discovery-repository.ts`. Every method is
asynchronous even though the in-memory implementation resolves immediately,
because the eventual database and server implementations will not:

```
export interface DiscoveryRepository {
  listDiscoveries(): Promise<Discovery[]>
  getPlace(id: string): Promise<Place | null>
  addDiscovery(input: Omit<Discovery, 'id'>): Promise<Discovery>
  setFavorite(id: string, favorite: boolean): Promise<void>
}
```

These functions must exist in `src/domain/progress.ts`, all pure:

```
export function computeCityProgress(
  discoveries: Discovery[], totalPlacesInCity: number
): { discoveredCount: number; percent: number }

export function computeCategoryCounts(
  discoveries: Discovery[], places: Place[]
): Record<Category, number>

export function computeTasteBreakdown(
  discoveries: Discovery[], places: Place[]
): Array<{ category: Category; share: number }>
```

## Revision Notes

- 2026-08-15, during implementation: the signature of `computeCityProgress`
  above gained a `city` argument and returns a `CityProgress`, so that the city
  name travels with the numbers instead of being re-supplied at every call site.
  The block above is left as originally specified for the record; `src/domain/progress.ts`
  is the current truth.
- 2026-08-15, during implementation: `src/app/index.tsx` was rebuilt on the
  primitives, which the Bird's Eye View originally said would be left untouched.
  The reason was practical — the acceptance screen needed a way to be reached by
  hand — and the side benefit was a second, independent check that the primitives
  compose into a screen with no bespoke styling. The Bird's Eye View was updated
  to match.
- 2026-08-15, at closeout: the Validation section was rewritten to drop the web
  target. Every milestone had first been verified in a browser, which this repo
  subsequently ruled out as proof; all four were then re-verified on the iOS
  Simulator. The code did not change as a result — every check passed again on
  device — but the earlier "verified" claims were wrong about what they proved,
  and the record now says which run was which.
- 2026-08-15, at closeout: `src/app/design-system.tsx` and the button reaching it
  were deleted at the user's request, the acceptance screen having served its
  purpose. See the Decision Log for why deleting beat gating it behind a flag.
