# Make the app bilingual: Polish and English copy in `messages/*.json`

**IMPLEMENTER INSTRUCTION: Keep this plan up to date as you work.**
After each significant step, update the `Progress` section with what was done and what's next. If context is lost or you are interrupted, the plan must contain everything needed to resume. Treat the plan as the single source of truth for this work.

This ExecPlan is a living document. The sections `Progress`, `Surprises &
Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept
up to date as work proceeds.

Reference: This plan follows conventions from AGENTS.md (root) and
docs/exec-plans/create-plan-file.md.

## Purpose / Big Picture

Unmapp is a discovery app whose twenty-two screen designs in `app-design/v1/`
are written in Polish. Every string the app shows today is a Polish literal
typed directly into a component, which means the app can only ever be a Polish
app, and it means nobody can find the copy without grepping the source.

After this change the app shows Polish to somebody whose phone is set to Polish
and English to everybody else, and all of the copy lives in two JSON files that
a non-programmer can edit. Nothing about how screens are written changes except
that `"Odkryj to, czego nie ma na Twojej mapie"` becomes `t('home.headline')`.

You can see it working by opening the app on the iOS Simulator: on a Polish
simulator the headline reads "Odkryj to, czego nie ma na Twojej mapie", and
after switching the simulator to English (or temporarily forcing `lng: 'en'` in
`src/i18n/index.ts`) the same screen reads "Discover what your map never showed
you".

Two terms used throughout. A **message** is one piece of copy the user reads,
stored under a dotted key such as `home.headline`. A **locale** or **language
tag** is the short code the operating system uses for a language — `pl` for
Polish, `en` for English.

## Bird's Eye View

Before — copy is welded into the components that render it:

    src/app/index.tsx
      <Text variant="display">Odkryj to, czego nie ma na Twojej mapie</Text>
      <Text variant="body">Ekrany aplikacji jeszcze nie istnieją.</Text>

    src/domain/types.ts
      CATEGORY_LABELS   = { natura: 'natura', ... }        <- Polish only
      TIME_BUDGET_LABELS = { '30min': '30 minut', ... }    <- Polish only

    There is no English anywhere and no way to add it without editing screens.

After — copy is data, screens ask for it by key:

    messages/pl.json     messages/en.json      <- the copy, editable by anyone
          \                    /
           \                  /
            src/i18n/index.ts                  <- i18next init, run once
             |   reads expo-localization -> device language -> 'pl' or 'en'
             |
            src/app/_layout.tsx                <- side-effect import, before render
             |
            src/app/index.tsx
              const { t } = useTranslation()
              <Text variant="display">{t('home.headline')}</Text>

    src/i18n/i18next.d.ts derives the allowed key union from messages/pl.json,
    so t('home.headlin') is a compile error, not a runtime surprise.

Key changes:

    REMOVED                        ADDED                          UNCHANGED
    CATEGORY_LABELS (types.ts)     messages/pl.json               every component
    TIME_BUDGET_LABELS (types.ts)  messages/en.json               design tokens
    Polish literals in index.tsx   src/i18n/index.ts              the repository
                                   src/i18n/i18next.d.ts          routes / layout shape
                                   "@/messages/*" tsconfig alias
                                   expo-localization, i18next,
                                   react-i18next, intl-pluralrules

Data flow for one string, from app launch to pixels:

    iOS language setting ("Polski")
        |
        v
    Localization.getLocales()  ->  [{ languageCode: 'pl', ... }, ...]
        |
        v
    resolveDeviceLanguage()    ->  'pl'          (falls back to 'en')
        |
        v
    i18next.init({ resources: { pl, en }, lng: 'pl', fallbackLng: 'en' })
        |
        v
    useTranslation() in a screen  ->  t('home.headline')
        |
        v
    messages/pl.json .home.headline  ->  "Odkryj to, czego nie ma na Twojej mapie"
        |
        v
    <Text variant="display"> on screen

## Assumptions

The app follows the device and nothing else, so no key-value storage is needed
and the app never has to re-read the language at runtime: iOS relaunches an app
when its language setting changes. This was confirmed with the user and is in
the Decision Log, not an open assumption.

Place names and descriptions in `src/data/in-memory-repository.ts` ("Ukryty
punkt widokowy", "Stary sad w Giszowcu") are content, not interface copy. They
stay in Polish and stay in the repository. When real data arrives it will carry
its own language; translating fixtures would be inventing a problem.

## Open Questions

None. The three that existed were answered before implementation began and are
recorded in the Decision Log.

## Progress

- [x] (2026-08-15 19:35Z) Asked the three blocking questions: translation
      engine, source of the current language, message file layout.
- [x] (2026-08-15 19:38Z) Installed `expo-localization` with `npx expo install`
      (it added itself to `app.json` plugins), and `i18next` + `react-i18next`
      with `npm install`.
- [x] (2026-08-15 19:40Z) Wrote `messages/pl.json` and `messages/en.json`,
      `src/i18n/index.ts`, `src/i18n/i18next.d.ts`; added the `@/messages/*`
      alias to `tsconfig.json`; wired the side-effect import into
      `src/app/_layout.tsx`; moved `src/app/index.tsx` onto `t()`.
- [x] (2026-08-15 19:40Z) Deleted `CATEGORY_LABELS` and `TIME_BUDGET_LABELS`
      from `src/domain/types.ts` (both were unused) and moved their labels into
      the message files under `category.*` and `timeBudget.*`, adding a
      `transport.*` set for the `Transport` type that never had labels.
- [x] (2026-08-15 19:41Z) Proved the typed keys work: a scratch file calling
      `t('home.headlin')` fails `npx tsc --noEmit` with "Did you mean
      'home.headline'?", while `t(\`category.${c}\`)` and
      `t('discovery.count', { count: 3 })` both compile.
- [x] (2026-08-15 19:42Z) Verified on the iOS Simulator (iPhone 17, iOS 26.4,
      device language pl-PL): Polish copy renders; forcing `lng: 'en'` renders
      the English copy; reverted.
- [x] (2026-08-15 19:44Z) Found and fixed broken Polish plurals — see Surprises
      & Discoveries. Added the `intl-pluralrules` polyfill and re-verified all
      four Polish forms on the simulator.
- [x] (2026-08-15 19:48Z) Updated `README.md` (project layout, new "Language"
      section) and `AGENTS.md` (alias list, no-literal-strings constraint, two
      new rows in the "Where to look first" table).
- [x] (2026-08-15 19:56Z) Moved this plan to `docs/exec-plans/completed/`. The
      tree is deliberately left dirty for the user to commit.

## Surprises & Discoveries

- Observation: Hermes on iOS does not implement `Intl.PluralRules`, and i18next
  uses it for every count. Without it, Polish silently renders the `_other`
  form for all numbers, which is grammatically wrong for the majority of counts
  and produces no warning.
  Evidence: rendering `[1, 2, 5, 22].map((count) => t('discovery.count', { count }))`
  on the simulator gave

      1 odkryte miejsce · 2 odkrytego miejsca · 5 odkrytego miejsca · 22 odkrytego miejsca

  After adding `import 'intl-pluralrules'` at the top of `src/i18n/index.ts`,
  the same line gave the correct four forms

      1 odkryte miejsce · 2 odkryte miejsca · 5 odkrytych miejsc · 22 odkryte miejsca

  English is unaffected — it only has `one` and `other`, so the bug would never
  have been noticed in an English-first codebase.

- Observation: `npx expo install expo-localization` edits `app.json` on its own,
  appending `"expo-localization"` to `expo.plugins`. That is a native config
  change, so a dev client built before this change must be rebuilt.
  Evidence: `app.json` `plugins` went from two entries to three without being
  edited by hand.

- Observation: i18next's TypeScript types understand plural suffixes. Keys
  written as `discovery.count_one` / `_few` / `_many` / `_other` in the JSON
  collapse into a single allowed key `discovery.count`, so the type derived from
  `pl.json` is exactly the key set a caller should use.
  Evidence: the scratch typecheck accepted `t('discovery.count', { count: 3 })`
  even though no key of that literal name exists in the JSON.

## Decision Log

- Decision: Use `react-i18next` (with `i18next`) rather than a hand-written
  translation module or `i18n-js`.
  Rationale: user's choice when asked. It brings plurals, interpolation, and
  fallbacks that would otherwise be hand-rolled, and its `CustomTypeOptions`
  augmentation gives fully typed keys, which was the main argument for writing
  our own.
  Date/Author: 2026-08-15, Szymon (decision) / Claude (implementation).

- Decision: The language comes from the device only. No picker, no persistence,
  no storage dependency.
  Rationale: user's choice when asked. iOS already has a per-app language
  setting and relaunches the app when it changes, so a second control inside the
  app would be a duplicate. A picker can be added with the settings screen
  (`app-design/v1/18-ustawienia.png`) if it turns out to be wanted; that would
  need a key-value store, which this change deliberately avoids taking on.
  Date/Author: 2026-08-15, Szymon (decision) / Claude (implementation).

- Decision: One JSON file per language, sections nested inside, rather than a
  directory per language with a file per screen.
  Rationale: user's choice when asked. Metro cannot enumerate a directory at
  runtime, so per-screen files would need a hand-maintained barrel module that
  imports each one — more moving parts than two files are worth at this size.
  Date/Author: 2026-08-15, Szymon (decision) / Claude (implementation).

- Decision: `messages/` sits at the repository root, not under `src/`, and is
  reached through a new `@/messages/*` path alias.
  Rationale: the user asked for a `messages` folder, and copy is content rather
  than source. The alias mirrors the existing `@/assets/*` -> `assets/*` entry,
  so the "no deep relative chains" rule in AGENTS.md still holds.
  Date/Author: 2026-08-15, Claude.

- Decision: Polish is the source of truth for the key set; the TypeScript key
  union is derived from `messages/pl.json`.
  Rationale: the designs are Polish, so Polish copy is written first. Polish
  also carries the most plural forms (one/few/many/other against English's
  one/other), so a key set derived from it covers every form English needs. The
  cost is that a key present only in English is invisible to the type checker,
  which is the harmless direction.
  Date/Author: 2026-08-15, Claude.

- Decision: Deleted `CATEGORY_LABELS` and `TIME_BUDGET_LABELS` from
  `src/domain/types.ts` instead of leaving them alongside the message files.
  Rationale: two sources for the same label is how translations drift. Both were
  exported but unused (`grep -rn "CATEGORY_LABELS\|TIME_BUDGET_LABELS" src/`
  matched only their own definitions), so nothing broke. The ASCII enum values
  are now message keys, which is why `t(\`category.${place.category}\`)` works.
  Date/Author: 2026-08-15, Claude.

- Decision: Kept `discovery.count` in both message files even though no screen
  uses it yet.
  Rationale: it is the worked example of the four Polish plural forms and the
  regression test for the `intl-pluralrules` polyfill — the next screen that
  counts discoveries (`08-odkryto`, `15-dziennik`) copies it rather than
  guessing. Deleting it would leave the polyfill looking unmotivated.
  Date/Author: 2026-08-15, Claude.

- Decision: `react: { useSuspense: false }` in the i18next config.
  Rationale: both message files are bundled, so `init()` completes
  synchronously and no screen ever waits for translations. Leaving Suspense on
  would mean relying on a boundary that `src/app/_layout.tsx` does not have.
  Date/Author: 2026-08-15, Claude.

## Outcomes & Retrospective

The app is bilingual. Copy is data in `messages/pl.json` and `messages/en.json`,
the device decides the language, mistyped keys fail the type check, and Polish
plurals are correct — which they would not have been without the simulator
check, since the failure is silent and produces plausible-looking text.

What remains, deliberately out of scope:

- No language picker and no persisted preference. Both were ruled out above.
  Adding them later means a key-value store plus `i18next.changeLanguage()`.
- No locale-aware number, date, or distance formatting. The mockups show
  strings like "8 sierpnia · 23 km", and rendering that in English will need an
  `Intl.DateTimeFormat` helper reading the active language. No screen formats a
  date yet, so nothing was built. Note that Hermes' `Intl` gaps found here mean
  that helper must be checked on the simulator too, not assumed.
- Only `src/app/index.tsx` was converted, because it is the only screen that
  exists. The twenty-one screens still to be built are written against `t()`
  from the start.

Lesson worth carrying forward: for this project "it type-checks and it bundles"
is a weak signal. The plural bug passed both gates and rendered wrong text.

## Context and Orientation

The repository is an Expo SDK 57 app using expo-router, iOS only. Before this
change `src/app/` held exactly two files, `_layout.tsx` (the root `<Stack />`
plus font loading and the splash-screen handoff) and `index.tsx` (a placeholder
home screen built from the design primitives in `src/components/`).

Files this change touches, by full path:

- `messages/pl.json`, `messages/en.json` — new. All copy, in nested sections.
- `src/i18n/index.ts` — new. Initialises i18next; exports
  `SUPPORTED_LANGUAGES`, `Language`, `FALLBACK_LANGUAGE`, `resources`,
  `resolveDeviceLanguage()`, and the i18next instance as the default export.
- `src/i18n/i18next.d.ts` — new. Declares `CustomTypeOptions` so `t()` is typed.
- `tsconfig.json` — adds `"@/messages/*": ["./messages/*"]`.
- `src/app/_layout.tsx` — adds `import '@/i18n';`, a side-effect import placed
  with the other imports so i18next is initialised before any screen renders.
- `src/app/index.tsx` — uses `useTranslation()`; the two Polish literals become
  `t('home.headline')` and `t('home.placeholder')`. "UNMAPP" stays a literal
  because a brand name is not translated.
- `src/domain/types.ts` — the two label maps are deleted; the file comment now
  says where labels live.
- `package.json` — adds `expo-localization` (`~57.0.1`), `i18next` (`^26.3.6`),
  `react-i18next` (`^17.0.11`), `intl-pluralrules` (`^2.0.1`).
- `app.json` — `expo.plugins` gains `"expo-localization"`, added automatically
  by `npx expo install`. This is native config: a previously built dev client
  needs rebuilding, though Expo Go already contains the module.
- `README.md`, `AGENTS.md` — documentation, per the "Keeping docs current" rules
  in AGENTS.md (new top-level directory, new path alias, new `app.json` plugin).

No route is added, moved, or removed: `src/app/` still contains `_layout.tsx`
and `index.tsx`. No external service is involved and nothing runs in the
background. The screen exercised is the placeholder home screen; no mockup from
`app-design/v1/` is implemented by this change.

## Plan of Work

Install the dependencies first, because `npx expo install expo-localization`
edits `app.json` and it is easier to see that as its own step. `expo-localization`
must go through `npx expo install` so the version matches SDK 57;
`i18next`, `react-i18next`, and `intl-pluralrules` are not Expo packages and go
through `npm install`.

Write the two message files. Group keys by screen or by domain concept —
`home` for the home screen, `category`, `transport`, and `timeBudget` for the
enum labels, `discovery` for counts. The enum sections are keyed by the exact
ASCII identifiers in `src/domain/types.ts` (`natura`, `polDnia`, ...) so a
screen can build the key from the value it already holds.

Add the `@/messages/*` alias to `tsconfig.json`, mirroring the `@/assets/*`
entry that is already there. Expo's Metro resolver reads these, which is why
`@/*` imports work today without extra Babel configuration.

Write `src/i18n/index.ts`. It imports the polyfill first, then both message
files, resolves the device language by walking `Localization.getLocales()` and
returning the first `languageCode` we translate, and calls `i18next.init()` with
both languages preloaded. Preloading is what makes initialisation synchronous
and lets Suspense stay off.

Write `src/i18n/i18next.d.ts` with the `CustomTypeOptions` augmentation whose
`resources.translation` is `typeof pl`. This is what turns a mistyped key into a
compile error.

Import `@/i18n` for its side effect at the top of `src/app/_layout.tsx`, then
convert `src/app/index.tsx` to `useTranslation()`.

Finally delete the two now-duplicated label maps from `src/domain/types.ts` and
update `README.md` and `AGENTS.md`.

## Concrete Steps

Run everything from the repository root, `/Users/szymon/Documents/projects/unmapp`.

    npx expo install expo-localization
    # Expected: "Installing 1 SDK 57.0.0 compatible native module using npm"
    # then "Added config plugin: expo-localization"

    npm install i18next react-i18next intl-pluralrules
    # Expected: npm's usual "added N packages" summary

    npx tsc --noEmit
    # Expected: no output, exit code 0

    npx expo export --platform ios --output-dir /tmp/unmapp-export
    # Expected: an "ios bundles (1)" line naming a .hbc file, then
    # "Exported: /tmp/unmapp-export"

To confirm the typed keys actually reject a typo, create a scratch file, run the
type checker, and delete it:

    cat > src/i18n/probe.ts <<'EOF'
    import i18next from '@/i18n';
    export const typo = i18next.t('home.headlin');
    EOF
    npx tsc --noEmit
    # Expected: src/i18n/probe.ts(2,33): error TS2345 ... Did you mean 'home.headline'?
    rm src/i18n/probe.ts

## Validation and Acceptance

There is no test suite. Acceptance is the type checker, the bundle check, and
looking at the app on the iOS Simulator.

    npx tsc --noEmit
    # Expected: no output, exit code 0

    npx expo export --platform ios --output-dir /tmp/unmapp-export
    # Expected: "ios bundles (1)" then "Exported: /tmp/unmapp-export"

Then look at the app on the iOS Simulator. Do not start Metro — one instance is
kept running in the background; attach to it. If nothing is running, say so and
stop. Never check this on web: it uses a different JavaScript engine, so the
`Intl.PluralRules` gap that broke Polish plurals here does not even reproduce
there.

On the home screen, with the simulator's language set to Polish, expect the
eyebrow "UNMAPP", the headline "Odkryj to, czego nie ma na Twojej mapie", and
below it "Ekrany aplikacji jeszcze nie istnieją." — the same words as before,
now coming from `messages/pl.json`.

To see the English side, temporarily replace `lng: resolveDeviceLanguage()` with
`lng: 'en'` in `src/i18n/index.ts` and let Fast Refresh reload. Expect
"Discover what your map never showed you" and "The app's screens do not exist
yet." Revert the line afterwards and confirm the Polish copy returns.

To check plurals, temporarily render all four Polish forms in
`src/app/index.tsx`:

    <Text variant="caption">
      {[1, 2, 5, 22].map((count) => t('discovery.count', { count })).join(' · ')}
    </Text>

Expect exactly:

    1 odkryte miejsce · 2 odkryte miejsca · 5 odkrytych miejsc · 22 odkryte miejsca

If instead every count after the first reads "odkrytego miejsca", the
`intl-pluralrules` import at the top of `src/i18n/index.ts` is missing or was
placed after the i18next import. Remove the temporary block when done.

## Idempotence and Recovery

Every step is safe to repeat. `npx expo install expo-localization` will not add
the config plugin twice. `npx expo export` overwrites `/tmp/unmapp-export`.
Re-running the type checker changes nothing.

To back the whole change out: `git checkout -- .` and `git clean -fd` remove the
new files and restore the edited ones, then `npm install` restores
`node_modules` to match the restored `package.json`. Nothing is written outside
the repository and no native project is generated, so there is no other state to
clean up.

If the app shows a red screen saying `expo-localization` cannot be found, the
installed dev client predates this change; rebuild it. Expo Go already bundles
the module.

## Interfaces and Dependencies

Libraries, and why each one is here:

- `expo-localization` (`~57.0.1`) — reads the device's language list. Expo's own
  module, so it works in Expo Go without a custom build.
- `i18next` (`^26.3.6`) — the message lookup, interpolation, plurals, and
  fallback logic.
- `react-i18next` (`^17.0.11`) — the React binding, providing `useTranslation()`.
- `intl-pluralrules` (`^2.0.1`) — supplies `Intl.PluralRules`, which Hermes does
  not implement. Required for correct Polish plurals; see Surprises &
  Discoveries.

What must exist at the end, in `src/i18n/index.ts`:

    export const SUPPORTED_LANGUAGES = ['pl', 'en'] as const;
    export type Language = (typeof SUPPORTED_LANGUAGES)[number];
    export const FALLBACK_LANGUAGE: Language;
    export const resources: { pl: { translation: ... }; en: { translation: ... } };
    export function resolveDeviceLanguage(): Language;
    export default i18next;

And in `src/i18n/i18next.d.ts`:

    declare module 'i18next' {
      interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: { translation: typeof pl };
      }
    }

Screens do not import from `src/i18n` at all. They call `useTranslation()` from
`react-i18next` directly; the module is only imported for its side effect, once,
in `src/app/_layout.tsx`.
