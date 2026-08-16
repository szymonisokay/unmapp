# Build the map home screen: Mapbox, tab navigation, and the user's location

**IMPLEMENTER INSTRUCTION: Keep this plan up to date as you work.**
After each significant step, update the `Progress` section with what was done and what's next. If context is lost or you are interrupted, the plan must contain everything needed to resume. Treat the plan as the single source of truth for this work.

This ExecPlan is a living document. The sections `Progress`, `Surprises &
Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept
up to date as work proceeds.

Reference: This plan follows conventions from AGENTS.md (root) and
docs/exec-plans/create-plan-file.md.

## Purpose / Big Picture

Unmapp opens on a map of the city you are in, with a blue dot where you are
standing, a header saying how much of that city you have uncovered, and a card
offering one place to go right now. That screen is
`app-design/v1/04-mapa.png`, and it is the whole product in one view. Today the
app opens on a placeholder that says the screens do not exist yet.

After this plan, launching the app on a phone shows a real, interactive,
pannable map styled toward the app's cream palette, with the user's actual
position on it, reachable from a tab bar with four tabs (Mapa, Odkryj, Misje,
Profil) — the other three being honest placeholders. The user is asked for
location permission the first time, and the screen has something sensible to
show when they say no.

Three terms, defined once. A **development build** is a version of the app
compiled from native code onto the simulator or a phone; it replaces Expo Go,
which can only run apps built from JavaScript plus whatever native modules
Expo Go already contains. A **config plugin** is a JavaScript function that
edits the native project during `npx expo prebuild`, so that native settings can
live in the Expo config rather than in hand-edited Xcode files. A **map style**
is a JSON document telling the map renderer what colour every road, park, and
label should be; Mapbox hosts these and hands them out as a URL.

## Bird's Eye View

Before — one route, no navigation, no native code of our own:

    src/app/
      _layout.tsx        <Stack />, fonts, splash, i18n init
      index.tsx          placeholder headline on a cream background

    Runs in Expo Go. There is no ios/ directory, and app.json is static JSON.

After — a tab navigator whose first tab is the map:

    src/app/
      _layout.tsx              <Stack screenOptions={{ headerShown: false }}>
      (tabs)/
        _layout.tsx            <Tabs> with a custom cream tab bar
        index.tsx              MAPA   — the map screen (04-mapa.png)
        odkryj.tsx             ODKRYJ — placeholder
        misje.tsx              MISJE  — placeholder
        profil.tsx             PROFIL — placeholder

    src/components/map/
      DiscoveryMap.tsx         the Mapbox view + camera + user dot
      MapHeaderCard.tsx        "TWOJA MAPA / Katowice — 63% odkryte"
      NearbyCard.tsx           "DZIŚ W POBLIŻU" + Zaskocz mnie / Filtry

    src/location/
      use-user-location.ts     permission + position, as a hook with states

    Runs from a development build. app.config.ts replaces app.json so that the
    Mapbox secret token comes from .env.local instead of from git.

What changes, at a glance:

    REMOVED                 ADDED                          UNCHANGED
    the placeholder home    (tabs)/ route group            every design token
    app.json (-> .ts)       Mapbox + expo-location deps    every existing component
    Expo Go workflow        expo-dev-client + ios/ build   the i18n setup
                            app.config.ts + .env.local     the repository/domain layer
                            ios.bundleIdentifier

How one map frame reaches the screen:

    app launch
        |
        v
    src/app/_layout.tsx  -- imports '@/i18n', loads fonts, hides splash
        |
        v
    src/app/(tabs)/_layout.tsx  -- four tabs, custom tab bar, MAPA active
        |
        v
    src/app/(tabs)/index.tsx
        |
        +--> useUserLocation()          --> expo-location
        |      asks permission once            |
        |      returns idle | asking |         v
        |      granted(coords) | denied   CoreLocation (iOS)
        |
        +--> <DiscoveryMap>             --> @rnmapbox/maps
        |      styleURL from constants         |
        |      camera centred on coords        v
        |      user dot                   Mapbox tile servers (network)
        |
        +--> <MapHeaderCard>            --> in-memory repository
        |      city + percent discovered      computeCityProgress()
        |
        +--> <NearbyCard>               --> static copy for now; "Zaskocz mnie"
               headline + two buttons         is wired in a later plan

## Assumptions

The app is a Polish-market app being developed on a Mac with Xcode installed,
and the target is the iOS Simulator. Nothing here is checked on Android or web.

The Mapbox account is Szymon's to create; this plan never asks an agent to
create an account, accept terms, or handle the tokens. Every token step is
written as an instruction for Szymon to perform.

The `63%` in the header comes from `computeCityProgress` over the fixture
discoveries in `src/data/in-memory-repository.ts`, not from a real catalogue. It
will show whatever those four fixtures produce, which is the honest number for
the data we have. Verify the actual value when the header is built rather than
hardcoding 63.

The "Zaskocz mnie" button belongs to `05-zaskocz-mnie.png`, which is not built.
In this plan it renders and is pressable but navigates nowhere; see Outcomes.

## Open Questions

None. Both have been answered — see the Decision Log.

## Progress

- [x] (2026-08-15 19:58Z) Reviewed `app-design/v1/04-mapa.png`, `08-odkryto.png`,
      `09-skala-eksploracji.png`, `11-trasa.png` to establish what the map must
      look like.
- [x] (2026-08-15 20:00Z) Resolved the four blocking questions with Szymon
      (library, scope, style source, who builds) — see Decision Log.
- [x] (2026-08-15 20:12Z) Plan approved by Szymon. Bundle identifier settled as
      `com.szymonwalach.unmapp`; public Mapbox token already generated.
- [x] (2026-08-15 20:20Z) Milestone 1, code half — installed `expo-dev-client`,
      `expo-location`, `@rnmapbox/maps` (10.3.5); replaced `app.json` with
      `app.config.ts` carrying `bundleIdentifier`, the `expo-location` plugin
      with a Polish permission string, and the Mapbox plugin reading its token
      from the environment; wrote `.env.example` and a blank `.env.local`,
      confirmed gitignored via `git check-ignore`.
- [x] (2026-08-15 20:53Z) Milestone 1, build half — Szymon ran `prebuild` and
      `run:ios` after unblocking CocoaPods (see Surprises). App installed and
      launched on iPhone 17 as `com.szymonwalach.unmapp`.
- [x] (2026-08-15 20:26Z) Milestone 2 — `(tabs)` group with four screens, custom
      geometric tab icons, root `Stack` headers off, old `src/app/index.tsx`
      deleted, tab labels and placeholder copy in both message files.
- [x] (2026-08-15 20:34Z) Milestone 3 — `map-style.ts`, `DiscoveryMap`,
      `MapHeaderCard`, `NearbyCard`, composed in `(tabs)/index.tsx`; added
      `src/data/repository.ts` (singleton) and `use-city-progress.ts`.
- [x] (2026-08-15 20:34Z) Milestone 4 — `useUserLocation()` with four states,
      wired into the map screen including the two failure notes.
- [x] (2026-08-15 21:03Z) Verified Milestones 2-4 on the Simulator: four tabs
      switch and render, no header bar, the map draws and the camera flies to the
      device position with the location puck, the header card reads
      "Katowice - 67% odkryte" (the fixtures' real number, not the mockup's 63),
      and both cards float clear of the status bar and the tab bar.
- [x] (2026-08-15 21:08Z) Removed the `web` block from `app.config.ts`, which was
      making every dev-server start fail two web bundles. iOS re-verified:
      `npx tsc --noEmit` exit 0, `npx expo export --platform ios` exit 0.
- [x] (2026-08-15 21:19Z) Replaced the fixed bottom card with `NearbySheet`, a
      two-position sheet (closed: handle plus the "Dziś w pobliżu" label at 88 pt;
      open: 55% of the screen), driven by reanimated and gesture-handler. Mounted
      `GestureHandlerRootView` in the root layout — expo-router does not provide
      one. Lifted the Mapbox logo and attribution above the closed sheet through
      the new `ornamentBottomInset` prop on `DiscoveryMap`, which settles the
      terms-of-service obligation the old card violated. Verified on the
      Simulator: tap and drag both open and close it, dragging the card body does
      nothing, and the map holds position throughout.
- [x] (2026-08-15 21:24Z) Reworked the open height from a fixed 55% to
      content-driven measurement — see the Decision Log. Re-verified on the
      Simulator: no empty space below the buttons, tap opens, drag closes, map
      unmoved.
- [x] (2026-08-15 21:30Z) Fixed the gap that appeared under the card while it
      opened, by clamping the spring's overshoot — see the Decision Log.
- [x] (2026-08-15 21:45Z) Wrote the cream cartography as a Mapbox Style
      Specification document at `map-style/unmapp-cream.json`, validated with
      `gl-style-validate` (exit 0). Szymon uploads it to Studio by hand; the
      resulting style URL then replaces `MAP_STYLE_URL`. Documented the round
      trip in README.md and added a row to the AGENTS.md table.
- [x] (2026-08-15 21:58Z) Added two label layers to the style — city names and
      district names, both from `place_label` — and re-validated (exit 0).
- [x] (2026-08-15 22:04Z) Switched label typography to Poppins, the app's own
      sans, after confirming through the Mapbox Fonts API that Regular, Medium
      and SemiBold all resolve — no font upload needed.
- [x] (2026-08-15 22:12Z) Added street-name and landmark labels and strengthened
      the buildings, on Szymon's report that the map was too bare to orient by.
      Thirteen layers, validator exit 0.
- [x] (2026-08-15 21:51Z) Szymon published the style and swapped `MAP_STYLE_URL`.
      Verified on the Simulator: cream basemap matching `colors.background`,
      Poppins labels, street names along the roads from zoom 14, building
      footprints with outlines at high zoom.
- [x] (2026-08-15 22:20Z) Fixed two faults found in that check — POI labels
      filtered by class rather than density alone, and the district layer's
      `maxzoom` removed. Szymon re-uploaded; verified on the Simulator with
      Katowice as the simulated position: Polish district names with full
      diacritics (Koszutka, Załęże, Brynów-Osiedle Zgrzebnioka), no hotels, and
      the header's "Katowice" finally agreeing with the map.
- [x] (2026-08-15 22:35Z) Fixed the empty low-zoom map — see Surprises. Added
      country labels and administrative boundaries, moved settlement filtering
      from `symbolrank` to `filterrank`, widened major roads. Sixteen layers,
      validator exit 0, file reformatted with `gl-style-format`. **Needs
      re-upload before it can be checked.**
- [ ] Swap `MAP_STYLE_URL` in `src/components/map/map-style.ts` once the style is
      published, and look at it on the Simulator. Until then the map runs on a
      stock style and does not resemble `app-design/v1/04-mapa.png`.
- [x] (2026-08-15 20:40Z) Updated README.md (new Get started with prebuild, the
      layout tree, a "The map" section) and AGENTS.md (`app.config.ts`, no Expo
      Go, secrets in `.env.local`, three new table rows).
- [ ] Move this plan to `docs/exec-plans/completed/` when the work is committed.

## Surprises & Discoveries

- Observation: The secret Mapbox download token is **not** required (this
  resolves the second open question). The iOS build succeeded with
  `MAPBOX_DOWNLOAD_TOKEN` empty.
  Evidence: `.env.local` held a zero-length value while `ios/Podfile.lock`
  resolved `rnmapbox-maps (10.3.5)`, `MapboxMaps (11.23.1)` and
  `MapboxCommon (24.23.1)`, and the app installed and ran. The plumbing stays in
  `app.config.ts` and `.env.example` anyway: it costs nothing and it is the first
  thing to reach for if a future SDK bump starts demanding the token again.

- Observation: The build blocker was neither CocoaPods nor Ruby, which is what
  Expo's error text pointed at. This Mac has two active accounts —
  `szymonwalach` (uid 501) and `szymon` (uid 502) — and `/opt/homebrew` is owned
  by the former with `drwxr-xr-x`, so the latter cannot write to it. Homebrew's
  own suggested fix, `sudo chown -R szymon /opt/homebrew`, would have taken
  Homebrew away from an account in daily use. The unblocking command was
  `sudo -u szymonwalach -H brew install cocoapods`, which changes no ownership.
  The `gem` route was independently dead: `/usr/bin/ruby` is 2.6.10 while
  CocoaPods 1.17 pulls `activesupport 7.2`, which needs Ruby >= 3.1.
  Evidence: `ls -ld /opt/homebrew` reporting `szymonwalach admin` against
  `id -un` reporting `szymon`.

- Observation: An alarming log line — `@rnmapbox/maps native code not available`,
  repeated ten times — was stale and harmless. Every occurrence was timestamped
  20:22-20:26, before the development build existed, when Expo Go was still
  loading a bundle that imported Mapbox. Nothing after the 20:53 rebuild.
  Evidence: parsing the `_t` fields in `.expo/dev/logs/start.log`; the last
  matching event is 20:26:32 and the 1,300 later lines contain none.

- Observation: 132 tile requests all finishing with `NSURLErrorCancelled (-999)`
  also looked like a failure and was not. Those are intermediate zoom levels
  (2, 4, 9, 11) discarded while the camera flies in to zoom 12 — ordinary Mapbox
  behaviour. The grey rectangle seen at first was simply the frame before tiles
  arrived; the map draws correctly once the camera settles.
  Evidence: the token verified independently against the API — `styles/v1`,
  `v4/...vector.pbf` and `tokens/v2` all returning 200 — and a later screenshot
  showing a fully drawn map.

- Observation: `web: { output: 'static' }` made the dev server eagerly build a
  web bundle and a server-render bundle on every start, and both failed:
  `@rnmapbox/maps` imports `mapbox-gl/dist/mapbox-gl.css` through its web entry
  point, and `mapbox-gl` is not installed. iOS was never affected.
  Evidence: `Metro error: Unable to resolve module mapbox-gl/dist/mapbox-gl.css`
  with an import stack ending at `src/app (require.context)`, alongside
  `Web Bundling failed`, while the iOS bundle built and the app ran.

- Observation: `symbolrank` and `filterrank` are not interchangeable, and using
  the wrong one emptied the map at low zoom. `symbolrank` (1-19) is constant
  across zoom levels — it ranks how important a place is. `filterrank` (0-5) is
  relative to the current zoom and is the density control. The settlement layer
  filtered on `symbolrank` through a zoom step, which meant the thresholds were
  meaningless: at zoom 5 over Poland the map rendered exactly one label, Berlin,
  and at zoom 8 none at all. Country names and administrative boundaries were
  missing entirely on top of that, and major roads were 0.4 px of `#E5E3DD` on
  `#F7F4EE`, which is invisible.
  Evidence: Static Images API renders of the published style at zoom 5 and zoom
  8 centred on 19.0, 51.9.
  Fix: settlements filter on `filterrank <= 3` and use `symbolrank` for text
  size, which is its documented purpose; added `label-country`, `admin-country`
  and `admin-state`; widened major roads at low zoom.

- Observation: The Static Images API is a far better tool than the Simulator for
  checking a map style. `GET /styles/v1/{user}/{id}/static/{lon},{lat},{zoom}/{w}x{h}@2x`
  renders the published style at any zoom in one request, with the zoom stated
  rather than guessed. Pinch gestures driven into the Simulator were unreliable —
  one timed out, another was read as a swipe and switched tabs. Use static
  renders for cartography and the Simulator for the app around it.

- Observation: Filtering POI labels on `filterrank` alone is not a density
  control, it is a popularity control, and popularity in a city centre means
  hotels. At `filterrank <= 2` in downtown San Francisco the map showed eight
  labels and every one was a hotel — Four Seasons, Marriott Marquis, Hilton,
  Intercontinental — which is precisely the opposite of what a discovery app
  should surface. The fix was to filter on `class` instead and let `filterrank`
  be looser: the whitelist does the real work.
  Evidence: Simulator screenshot at zoom ~16 over Union Square.

- Observation: The district label layer was written with `maxzoom: 16`, so it
  switched off at exactly the zoom where someone walking around needs it. Caught
  only by looking at the running app; the style validator has nothing to say
  about a zoom range that is merely wrong.

- Observation: Mapbox Streets v8 has no `name_pl` field. Its localized name
  fields are `name_en`, `name_de`, `name_fr`, `name_es`, `name_it`, `name_pt`,
  `name_ru`, `name_ar`, `name_ja`, `name_ko`, `name_vi`, `name_zh-Hans` and
  `name_zh-Hant` — Polish is not among them. Map labels therefore cannot follow
  the app's language the way `t()` does; the style reads `name`, the local name,
  which is Polish in Poland and correct there but not translated anywhere else.
  Consequence for later: an English map means a second published style reading
  `name_en`, selected by language in `src/components/map/map-style.ts`. Mapbox
  bills per monthly active user rather than per style, so the second style costs
  nothing.

- Observation: A very fast flick on the sheet handle — 200 pt in 0.08 s, driven
  through the Simulator rather than by hand — registers as neither a pan nor a
  tap, and the sheet does not move. Too much travel to be a tap, too short a
  press for the pan to activate. Human flicks are an order of magnitude slower,
  so this is recorded rather than fixed; if it ever shows up in real use, the
  lever is the pan's activation distance.
  Evidence: sheet stayed closed after the flick; the same swipe at 0.35 s opens
  it every time.

- Observation: `expo-location` in the Simulator does not hang without a
  simulated position, as this plan guessed it might. It returns Apple's default
  location — San Francisco — so the map flies there while the header still reads
  "Katowice - 67%". The mismatch is honest, since the city is hardcoded and the
  position is real, but it is the first thing that looks wrong on screen. Set
  Features > Location > Custom Location to 50.2649 / 19.0238 for the intended
  pairing.

## Decision Log

- Decision: Use `@rnmapbox/maps` (Mapbox) rather than `expo-maps`,
  `react-native-maps`, or MapLibre.
  Rationale: Szymon's choice when asked, and the mockups force it. The map in
  `04-mapa.png` is custom cartography — cream base matching the app background,
  no POI labels, roads as thin beige hairlines, parks as soft green shapes.
  Apple Maps, which is what `expo-maps` and `react-native-maps` use on iOS,
  cannot be restyled at all: SDK 57's `expo-maps` offers only
  `AppleMapsColorScheme` (LIGHT/DARK/AUTOMATIC) plus POI category filtering, and
  it is documented as alpha that "will frequently experience breaking changes".
  Mapbox lets the style be authored in Mapbox Studio and referenced by URL, so
  changing the green of the parks is not a code change. MapLibre would give the
  same rendering for free but moves the cost to choosing, paying for, or hosting
  a tile source; Mapbox's free tier is 25,000 monthly active users, which this
  app will not approach for a long time. The APIs are close relatives —
  MapLibre React Native is a fork of `@rnmapbox/maps` — so switching later is a
  real escape hatch, not a rewrite.
  Date/Author: 2026-08-15, Szymon (decision) / Claude (research).

- Decision: This step covers the map, the tab bar, and location together.
  Rationale: Szymon's choice when asked. A map with no position is not the
  screen in the mockup, and a single map screen with no tab bar would need the
  navigation rebuilt as soon as a second screen lands.
  Date/Author: 2026-08-15, Szymon.

- Decision: Build on a stock Mapbox style now; author the cream style in Mapbox
  Studio afterwards.
  Rationale: Szymon's choice when asked. The style is one URL in one constants
  file, so it is not on the critical path for any code. Doing it second also
  means the style is tuned against a real running screen instead of a mockup.
  Date/Author: 2026-08-15, Szymon.

- Decision: The plan writes out the development-build commands; Szymon runs
  them.
  Rationale: Szymon's choice when asked. `npx expo prebuild` and an Xcode build
  can require an Apple ID, signing certificates, and interactive prompts. Those
  are his to enter, not something an agent should attempt.
  Date/Author: 2026-08-15, Szymon.

- Decision: Use expo-router's JavaScript `Tabs` with a custom tab bar, not the
  native tabs API that SDK 57 also offers.
  Rationale: the tab bar in `04-mapa.png` is a flat cream bar with four custom
  geometric icons — square, circle, diamond, circle — that echo the brand mark
  in `src/components/Mark.tsx`. A native iOS 26 tab bar renders as a system
  material with SF Symbols and cannot be made to look like that. Native tabs buy
  platform-correct behaviour that this design explicitly overrides. Reversible:
  swapping to native tabs later is a change to one file,
  `src/app/(tabs)/_layout.tsx`.
  Date/Author: 2026-08-15, Claude.

- Decision: Replace `app.json` with `app.config.ts` and keep tokens in
  `.env.local`.
  Rationale: the Mapbox secret download token, if required, is a plugin option
  inside the Expo config. `app.json` is committed, so putting a secret there
  publishes it — and `npx expo prebuild` copies it onward into the Podfile.
  A TypeScript config can read `process.env`, and `.env.local` is already
  covered by the `.env*.local` line in `.gitignore`. `.env.example` gets
  committed so the required names are discoverable. This contradicts the
  "Native config lives in `app.json`" line in AGENTS.md, which must be updated
  in the same commit.
  Date/Author: 2026-08-15, Claude.

- Decision: The iOS bundle identifier is `com.szymonwalach.unmapp` (resolved
  Open Question 1).
  Rationale: Szymon's choice when asked. A bundle identifier cannot be changed
  once the app is on the App Store, and the cost is asymmetric — a personal
  namespace costs nothing if the project later becomes commercial, while a
  company namespace becomes unfixable exactly when the project turns out to
  matter. This is a hobby project, so the personal namespace is the default.
  Date/Author: 2026-08-15, Szymon.

- Decision: Install all three native packages (`expo-dev-client`,
  `@rnmapbox/maps`, `expo-location`) in Milestone 1, and write Milestone 2's tab
  navigation before the first build, rather than following the milestones
  strictly in order.
  Rationale: every native package added means another `prebuild` and another
  Xcode build, and Szymon runs those by hand. Adding `expo-location` in
  Milestone 4 as originally written would cost a second full build cycle for no
  benefit. The tab navigation is pure JavaScript, so writing it early risks
  nothing the type check and bundle check would not catch, and it means the one
  build Szymon runs verifies Milestones 1 and 2 together. Milestones 3 and 4
  are then verified through Fast Refresh against that build.
  Date/Author: 2026-08-15, Claude.

- Decision: `useUserLocation()` returns four states — `asking`, `denied`,
  `unavailable`, `granted` — not the `idle | asking | denied | granted` the
  Interfaces section originally specified.
  Rationale: two changes, both to stop the type lying. `idle` was unreachable —
  the effect runs on mount, so the hook is never idle — and an unreachable state
  forces every caller to handle a case that cannot happen. `unavailable` was
  missing: a granted permission that yields no fix is a real and, on the
  Simulator, common outcome, and reporting it as `denied` would put a message on
  screen blaming the user for a refusal they never made.
  Date/Author: 2026-08-15, Claude.

- Decision: Added `src/data/repository.ts` (a module-level singleton) and
  `src/data/use-city-progress.ts`, neither of which the plan named.
  Rationale: `createInMemoryRepository()` keeps its discoveries in a closure, so
  a screen calling it per render would quietly get a fresh, empty-ish copy each
  time; there has to be exactly one instance. The hook exists so the map screen
  does not carry its own loading state — and so the `null` first frame, which is
  unavoidable with an async repository, is visible in the type rather than
  papered over.
  Date/Author: 2026-08-15, Claude.

- Decision: Removed the `web` block from `app.config.ts` rather than installing
  `mapbox-gl` or writing a `DiscoveryMap.web.tsx` stub.
  Rationale: `output: 'static'` made the dev server build a web bundle and a
  server-render bundle on every start, and both failed on `@rnmapbox/maps`'
  browser entry point. Installing `mapbox-gl` would mean carrying a browser map
  library, and a `.web.tsx` stub would mean maintaining a second map
  implementation — both for a platform AGENTS.md says is out of scope and
  nothing is checked against. Deleting the target makes the config agree with
  the documented scope. `npm run web` still exists and will now fail loudly if
  anyone tries it, which is the correct signal.
  Date/Author: 2026-08-15, Claude.

- Decision: The map style labels streets and landmarks, reversing the first
  draft's decision to label nothing.
  Rationale: Szymon's call after seeing it — "without street names it is hard to
  tell where you are". The original argument, that a discovery app should not
  name the places it asks you to find, holds for points of interest but not for
  streets: those are wayfinding, not spoilers, and a map you cannot orient
  yourself on fails at the one job it has. POI labels are filtered to
  `filterrank <= 2`, which names landmarks without listing every shop and so
  keeps most of the original intent. Buildings now fade in from zoom 14 rather
  than 15 and gain an outline from 16, because the emptiness was as much about
  missing texture as missing text.
  Worth recording: the mockup `app-design/v1/04-mapa.png` shows a map with no
  text at all, so the style now deliberately diverges from it. The mockup is a
  composition rendered at one zoom on a familiar city; it is not a specification
  for how the map behaves when someone is lost.
  Date/Author: 2026-08-15, Szymon (decision) / Claude (implementation).

- Decision: The opening spring uses `overshootClamping: true`, rather than
  raising `damping` until the symptom disappears.
  Rationale: Szymon reported a gap between the card and the tab bar during the
  opening animation. It was not a tuning error but the spring doing what springs
  do. At `damping: 20` and `stiffness: 200` the damping ratio is 0.71 — under
  1, so underdamped — and the animation overshoots its target by roughly 4%. The
  target is `translateY: 0` on a sheet anchored to the bottom edge, so overshoot
  means negative translation: the card lifts off the bottom and the map shows
  through beneath it. With `closedOffset` near 268 pt that is an 11 pt gap,
  matching what was seen. Raising damping past 28 (critical damping for this
  stiffness) also removes it, but only by slowing the animation, and it silently
  breaks again the next time someone changes `stiffness`. Clamping ends the
  animation at the target instead, which makes the gap structurally impossible
  and leaves the damping free to be chosen for feel.
  Date/Author: 2026-08-15, Szymon (report) / Claude (diagnosis and fix).

- Decision: The open sheet is as tall as its content, measured at layout time.
  This reverses the earlier "fixed 55% of the screen" choice, which shipped and
  was then looked at.
  Rationale: Szymon's call, after seeing it. At 55% the sheet had a quarter of
  its area empty below the buttons, and empty space inside a container whose
  whole justification was giving space back to the map reads as a mistake. The
  original argument for a fixed height — that a future list of suggestions would
  drop in without re-tuning the animation — turned out to be paying today for a
  screen that does not exist yet. Content-driven height needs no re-tuning
  either: the sheet measures itself with `onLayout` and recomputes where "closed"
  is, so growing content simply makes a taller sheet.
  A `MAX_HEIGHT_FRACTION` of 0.85 guards the one case that would be worse than
  empty space — content taller than the screen, which could not be closed. If
  that ceiling is ever reached the fix is to make the body scroll, not to raise
  it.
  Cost, stated plainly: the sheet cannot know its own height before the first
  layout pass, so it renders invisible for exactly one frame rather than flashing
  fully open.
  Date/Author: 2026-08-15, Szymon (decision) / Claude (implementation).

- Decision: The sheet's drag gesture is attached to the header strip only, and
  that strip carries `collapsable={false}`.
  Rationale: without it React Native flattens the header away — it holds only
  layout styles, no background — and two things break at once, both observed on
  the Simulator before the fix. The gesture ends up bound to the whole sheet, so
  dragging over the buttons moved it; and touches fell through to the Mapbox view
  underneath, so every drag panned the map as well. One property fixes both. It
  is the kind of defect a type check and a bundle check cannot see, and that only
  appears by dragging the thing.
  Date/Author: 2026-08-15, Claude.

- Decision: Hand-rolled the sheet on `react-native-reanimated` and
  `react-native-gesture-handler` rather than adding `@gorhom/bottom-sheet`.
  Rationale: both libraries are already in the project, and two snap points with
  one gesture is about eighty lines. `@gorhom/bottom-sheet` targets Reanimated 3
  while this project is on 4.5.1, so it would have added a compatibility risk to
  solve a problem that did not need it.
  Date/Author: 2026-08-15, Claude.

- Decision: Placeholder tabs (Odkryj, Misje, Profil) render a named, deliberate
  "not built yet" state rather than a blank screen.
  Rationale: a blank tab is indistinguishable from a crash or a failed render.
  Each placeholder names the mockup it is waiting for, so the app documents its
  own gaps.
  Date/Author: 2026-08-15, Claude.

## Outcomes & Retrospective

To be written at completion.

Already known to be out of scope, so that the next plan starts from an honest
picture:

- The cream Mapbox Studio style. Ships as a URL swap in
  `src/components/map/map-style.ts` (Decision Log above).
- "Zaskocz mnie" and "Filtry" render and are pressable but go nowhere.
  `05-zaskocz-mnie.png` is a separate screen and a separate plan.
- Markers for discovered places. `04-mapa.png` shows one labelled diamond
  ("Park Kościuszki"); this plan puts the user's dot on the map and leaves place
  markers to the plan that makes the recommendation flow real.
- Any persistence. Discoveries still come from the in-memory fixtures and still
  vanish on restart.
- Android. Untouched and unverified, per the repo's iOS-only rule.

## Context and Orientation

The repository is an Expo SDK 57 app using expo-router, iOS only, with no test
suite. Verification is a type check, a bundle check, and looking at the screen
on the iOS Simulator.

What exists today that this plan builds on:

- `src/app/_layout.tsx` — root layout. Renders `<Stack />`, loads the app fonts
  through `useAppFonts()`, hides the splash screen once they resolve, and
  imports `@/i18n` for its side effect so translations are ready before the
  first render.
- `src/app/index.tsx` — the placeholder home screen this plan replaces.
- `src/components/` — the design primitives: `Screen` (cream background plus
  safe area), `Card`, `Chip`, `PillButton`, `ProgressBar`, `StatTile`,
  `ListRow`, `Text` (the only way text is rendered), and `Mark` (the logo, which
  also works as a progress indicator).
- `src/design/tokens.ts` — every colour, spacing step, radius, and type style.
  Relevant here: `colors.background` `#F7F4EE`, `colors.surface` `#FFFDF8`,
  `colors.accent` `#FFAD5F`, `colors.mapHalo` `#CFDCC0`, `colors.locationDot`
  `#488ACB`. The last two exist precisely for this screen and have never been
  used.
- `src/domain/progress.ts` — pure functions turning discoveries into counts and
  percentages, including the city progress the header card needs.
- `src/data/in-memory-repository.ts` — four fixture discoveries in Katowice and
  a `PLACE_COUNT_BY_CITY` of `{ Katowice: 6 }`.
- `messages/pl.json` and `messages/en.json` — all user-visible copy. Per
  AGENTS.md, no string a user reads may be written in a component.

Routes added under `src/app/`, remembering that every file there is a URL:

- `src/app/(tabs)/_layout.tsx` — new. The tab navigator. The parentheses make
  `(tabs)` a route *group*: it organises files without adding a path segment, so
  the map lives at `/` and not at `/tabs`.
- `src/app/(tabs)/index.tsx` — new. The map screen, at `/`.
- `src/app/(tabs)/odkryj.tsx`, `misje.tsx`, `profil.tsx` — new placeholders.
- `src/app/index.tsx` — deleted; `(tabs)/index.tsx` takes over `/`.

Packages this needs, none of which are installed yet: `@rnmapbox/maps` (not an
Expo package — plain `npm install`), `expo-location` and `expo-dev-client`
(Expo packages — `npx expo install`, so versions match SDK 57).

`app.json` changes fundamentally: it becomes `app.config.ts`, gains
`ios.bundleIdentifier`, and gains two plugin entries. That is native config, so
a rebuild is required — which is the point of Milestone 1.

External services: Mapbox. The app fetches map tiles over the network at
runtime and authenticates with a public access token. There is no other network
call in this plan.

The screen implemented is `app-design/v1/04-mapa.png`. The permission screen
`app-design/v1/03-lokalizacja.png` informs how permission is requested, but is
not built as a separate route in this plan — see Milestone 4.

## Plan of Work

The work splits into four milestones, each of which leaves the app running.

### Milestone 1: Development build foundation

At the end of this milestone the app runs on the Simulator from a development
build instead of Expo Go, showing exactly the same placeholder screen as today.
Nothing looks different; everything underneath is.

Scope:

- Answer Open Question 1 and set `ios.bundleIdentifier`.
- `npx expo install expo-dev-client`.
- Convert `app.json` to `app.config.ts`: export a function returning the same
  config object, with the Mapbox plugin entry reading its token from
  `process.env`. Delete `app.json` — having both is ambiguous.
- Create `.env.local` (already gitignored) with the Mapbox tokens, and commit a
  `.env.example` listing the names with empty values.
- `npm install @rnmapbox/maps` and add its config plugin.
- `npx expo prebuild --clean`, then build and run.

What exists that did not before: an `ios/` directory (gitignored, never
committed), a development build installed on the Simulator, and a config that
can hold secrets without leaking them.

Acceptance: the app launches from the dev build and shows the current
placeholder screen with Polish copy. `npx tsc --noEmit` and
`npx expo export --platform ios --output-dir /tmp/unmapp-export` both pass.

Verify before proceeding: the app is running from the dev client, not Expo Go —
the dev client shows the project name in its launcher, and shaking the device
opens the dev menu with the project's own bundle identifier.

### Milestone 2: Tab navigation

At the end of this milestone the app has the four-tab bar from the mockup, with
the map tab still showing a placeholder.

Scope:

- Create the `(tabs)` group with `_layout.tsx` and four screens.
- Move the existing placeholder content into `(tabs)/index.tsx`; delete
  `src/app/index.tsx`.
- Write a custom tab bar matching `04-mapa.png`: cream `colors.surface`
  background, a hairline top border in `colors.border`, four items with
  geometric icons (square, circle, diamond, circle) drawn as plain `View`s with
  border radius and rotation rather than as an icon font — the shapes are simple
  enough that a dependency is not justified.
- Set the root `Stack` to `headerShown: false`, so the "index" header bar
  currently visible at the top of the Simulator disappears; the mockup has no
  navigation bar.
- Add the four tab labels to `messages/pl.json` and `messages/en.json` under
  `tabs.*`.

Acceptance: four tabs are visible and tappable; each shows its own screen; the
active tab is `colors.ink` and the rest `colors.textMuted`; no header bar at the
top; labels are Polish on a Polish simulator.

### Milestone 3: The map

At the end of this milestone the map tab renders a real, pannable map with the
header and nearby cards over it.

Scope:

- `src/components/map/map-style.ts` — exports the style URL and the fallback
  camera position (Katowice, 50.2649 / 19.0238, zoom ~12). One file, so the
  cream style later is a one-line change.
- `src/components/map/DiscoveryMap.tsx` — wraps `MapView` and `Camera` from
  `@rnmapbox/maps`, hides the Mapbox logo and attribution controls only as far
  as the Mapbox terms allow, and fills its parent.
- `src/components/map/MapHeaderCard.tsx` — the floating card at the top: the
  `Mark` in a circle, eyebrow "TWOJA MAPA", the city and percentage, and the
  large percentage on the right. Reads from `computeCityProgress` over the
  repository rather than hardcoding.
- `src/components/map/NearbyCard.tsx` — the bottom card: eyebrow "DZIŚ W
  POBLIŻU", the serif headline, and `PillButton` "Zaskocz mnie" plus an outline
  "Filtry".
- Compose them in `(tabs)/index.tsx`: map filling the screen, both cards
  floating over it, positioned with safe-area insets so the header clears the
  Dynamic Island and the bottom card clears the tab bar.
- All new copy into `messages/pl.json` and `messages/en.json` under `map.*`.

Acceptance: the map renders tiles, pans, and zooms; both cards float over it and
do not overlap the status bar or the tab bar; the percentage matches what
`computeCityProgress` returns for the fixtures.

### Milestone 4: The user's location

At the end of this milestone the map centres on the user and shows the blue dot,
and behaves sensibly when permission is refused.

Scope:

- `npx expo install expo-location`, and add its config plugin with a Polish
  permission string. The string the system shows is not translated by our i18n —
  iOS reads it from the built app — so it goes in the config, in Polish, and
  that limitation is recorded here rather than discovered later.
- `src/location/use-user-location.ts` — a hook returning a discriminated union:
  `{ status: 'idle' | 'asking' | 'denied' }` or
  `{ status: 'granted'; coords: { latitude: number; longitude: number } }`.
  It asks for foreground permission on first use and then reads the position
  once. Every state is a real state, not `undefined`.
- Wire it into `(tabs)/index.tsx`: on `granted`, move the camera to the coords
  and render the user dot with `colors.locationDot` and the `colors.mapHalo`
  glow. On `denied`, keep the Katowice fallback camera and show a line in the
  nearby card explaining that the map is not following them, with copy in the
  message files. On `asking`, the map shows the fallback position — no spinner
  covering the screen.

Acceptance: on first launch the iOS permission dialog appears with the Polish
text from the config. Granting it moves the camera to the simulated position and
draws the dot. Denying it leaves the map on Katowice with the explanatory line
and no crash. Both paths are checked by resetting permissions between runs.

## Concrete Steps

Run everything from `/Users/szymon/Documents/projects/unmapp`.

**Before any of this: Szymon creates the Mapbox account and tokens.** Nobody
else does this step. At <https://account.mapbox.com/access-tokens/>, copy the
Default Public Token (starts with `pk.`), and — only if Open Question 2 resolves
to "still required" — create a second token with the `DOWNLOADS:READ` scope
(starts with `sk.`).

Then, in the repository root, create `.env.local`. It is already gitignored by
the `.env*.local` line in `.gitignore`; confirm with `git check-ignore .env.local`,
which should echo the filename back.

    EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_public_token_here
    MAPBOX_DOWNLOAD_TOKEN=sk.your_secret_token_here

The `EXPO_PUBLIC_` prefix matters: Expo only exposes variables with that prefix
to the running app. The download token deliberately lacks it — it is used at
build time only and must never reach the bundle.

Install the packages:

    npx expo install expo-dev-client expo-location
    # Expected: "Installing 2 SDK 57.0.0 compatible native modules using npm"

    npm install @rnmapbox/maps
    # Expected: npm's "added N packages" summary

Generate the native project and build. This is the step that takes minutes
rather than seconds, and the one that can ask for an Apple ID:

    npx expo prebuild --clean
    # Expected: "Created native project", then "Config synced", then a CocoaPods
    # install. If it stops asking for an iOS bundle identifier, Open Question 1
    # was not resolved — resolve it first rather than typing an answer here.

    npx expo run:ios
    # Expected: a long Xcode build, then the app launching on the Simulator.
    # This is the one place the "never start the app" rule does not apply: a
    # development build has to be installed once before Metro can attach to it.

After the first build, the normal loop returns: leave Metro running and attach.
Rebuild only when native config changes — new native package, changed plugin,
changed permission string.

Verification, after each milestone:

    npx tsc --noEmit
    # Expected: no output, exit code 0

    npx expo export --platform ios --output-dir /tmp/unmapp-export
    # Expected: an "ios bundles (1)" line, then "Exported: /tmp/unmapp-export"

## Validation and Acceptance

There is no test suite. Acceptance is the type checker, the bundle check, and a
human looking at the iOS Simulator.

    npx tsc --noEmit
    # Expected: no output, exit code 0

    npx expo export --platform ios --output-dir /tmp/unmapp-export
    # Proves every route and import resolves, which the type checker does not.
    # Expected: "ios bundles (1)" then "Exported: /tmp/unmapp-export"

Then open the app on the iOS Simulator and check, in order:

1. There is no navigation header at the top. The status bar sits directly above
   the map.
2. Four tabs along the bottom — Mapa, Odkryj, Misje, Profil — on a cream bar
   with a hairline above it. Mapa is active and dark; the others are muted.
   Tapping each one switches screens; the three placeholders name the mockup
   they are waiting for.
3. The map fills the screen behind the cards, and responds to drag and pinch.
4. The header card floats at the top, clear of the Dynamic Island, reading
   "TWOJA MAPA" over "Katowice — N% odkryte", with N repeated large on the
   right. N must equal what `computeCityProgress` returns for the fixtures —
   check the number rather than assuming it is 63.
5. The nearby card floats above the tab bar with the serif headline, an orange
   "Zaskocz mnie" button, and an outlined "Filtry" button. Both press without
   crashing.
6. On first launch, iOS asks for location in Polish. Grant it: the camera moves
   to the simulated position and a blue dot with a soft halo appears.

For step 6 the Simulator needs a position: **Features > Location > Custom
Location**, latitude `50.2649`, longitude `19.0238` (Katowice). With Location set
to "None", the position request never resolves and the screen will look stuck.

To re-test the permission dialog, erase the app's permission state by
long-pressing the app icon in the Simulator, deleting the app, and running
`npx expo run:ios` again — or **Device > Erase All Content and Settings** for a
clean slate. Then deny permission and confirm the map stays on Katowice, shows
the explanatory line, and does not crash.

Two standing rules from AGENTS.md still hold. **Never verify on web** — it does
not even have the native map. **Never start Metro** — one instance is kept
running in the background; attach to it. The single exception is the first
`npx expo run:ios` of Milestone 1, which installs the development build and
cannot be avoided.

## Idempotence and Recovery

`npx expo install` and `npm install` are safe to repeat. `npx expo prebuild
--clean` is idempotent by design: it deletes `ios/` and regenerates it from
`app.config.ts`, which is why nothing may ever be hand-edited inside `ios/`.
If a build fails in a confusing way, `rm -rf ios && npx expo prebuild --clean`
is the reset, and it loses nothing because that directory is generated and
gitignored.

If the map renders as a blank grey rectangle, the public token is missing or
wrong. Check that `.env.local` contains `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`, and
restart Metro — env variables are read at bundle time, so a running Metro will
not pick up a new `.env.local`.

If the build fails while downloading the Mapbox native SDK with a 401 or 403,
that is Open Question 2 answering itself: the secret download token is required
and either missing or lacking the `DOWNLOADS:READ` scope.

To back the whole thing out: `git checkout -- . && git clean -fd` restores the
tracked files and removes new ones, `rm -rf ios` removes the native project, and
`npm install` restores `node_modules`. `.env.local` survives because it is
ignored — delete it by hand if the tokens should go too.

## Interfaces and Dependencies

New dependencies and why each is here:

- `@rnmapbox/maps` — the map. Chosen in the Decision Log. Not an Expo package,
  so it is installed with `npm install`; its version is not tied to the SDK.
- `expo-location` (`~57.x`) — permission and position. Expo package, so
  `npx expo install`.
- `expo-dev-client` (`~57.x`) — makes the built app a development client that
  attaches to Metro, replacing Expo Go. Expo package.

What must exist at the end:

    // src/location/use-user-location.ts
    export type UserLocation =
      | { status: 'idle' | 'asking' | 'denied' }
      | { status: 'granted'; coords: { latitude: number; longitude: number } };

    export function useUserLocation(): UserLocation;

    // src/components/map/map-style.ts
    export const MAP_STYLE_URL: string;
    export const FALLBACK_CAMERA: {
      centerCoordinate: [number, number];   // [longitude, latitude] — Mapbox order
      zoomLevel: number;
    };

    // src/components/map/DiscoveryMap.tsx
    export interface DiscoveryMapProps {
      /** Where to point the camera. Falls back to FALLBACK_CAMERA when absent. */
      center?: { latitude: number; longitude: number };
      /** Draws the blue dot and its halo. */
      showUserLocation: boolean;
    }
    export function DiscoveryMap(props: DiscoveryMapProps): JSX.Element;

Note the coordinate order: Mapbox takes `[longitude, latitude]` while
`expo-location` returns `{ latitude, longitude }`. Swapping them silently puts
Katowice in the Indian Ocean, which is the single easiest mistake to make in
this plan. `DiscoveryMap` takes the named-object form and does the conversion in
one place so no caller has to think about it.

Documentation that must be read before writing the code, per AGENTS.md — none of
this may be written from memory:

- <https://docs.expo.dev/versions/v57.0.0/sdk/location/>
- <https://docs.expo.dev/versions/v57.0.0/sdk/router/> and its Tabs page
- <https://rnmapbox.github.io/docs/install> and the component reference

The `building-native-ui` skill installed in this repo targets SDK 55 and links
v55 documentation. Treat anything it says about tabs as a candidate to check
against the v57 docs, not as fact.
