# unmapp

An [Expo](https://expo.dev) app (SDK 57) built with [expo-router](https://docs.expo.dev/router/introduction), targeting iOS, Android, and web.

## Requirements

- Node.js 20+
- iOS Simulator (Xcode) or Android emulator for native runs; the web target needs neither.

## Get started

```bash
npm install
```

```bash
npm start
```

Then pick a target from the Metro output, or start one directly:

```bash
npm run ios
```

```bash
npm run android
```

```bash
npm run web
```

## Project layout

```text
src/app/           expo-router routes — file name is the URL path
  _layout.tsx      root layout (Stack navigator)
  index.tsx        "/" screen
assets/images/     app icons, splash, and image assets
assets/expo.icon/  iOS icon composition source
app.json           Expo config: name, scheme, icons, plugins, experiments
tsconfig.json      strict TS; "@/*" -> ./src/*, "@/assets/*" -> ./assets/*
```

There is no `ios/` or `android/` directory — native projects are generated on demand
(`npx expo prebuild`) and are gitignored. Change native config in `app.json`, not in
generated folders.

## Verification

```bash
npx tsc --noEmit
```

Typecheck is the only check wired up today. `npm run lint` runs `expo lint`, which
prompts to install and configure ESLint the first time it is used — do that before
relying on it. There is no test setup yet; see
["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/) when one is needed.

## Docs

- [AGENTS.md](AGENTS.md) — how agents (and new contributors) should work in this repo.
- [Expo SDK 57 docs](https://docs.expo.dev/versions/v57.0.0/) — the versioned reference this repo is pinned to.
