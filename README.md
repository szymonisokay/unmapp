# unmapp

An [Expo](https://expo.dev) app (SDK 57) built with [expo-router](https://docs.expo.dev/router/introduction). **iOS is the only target for now.** The codebase stays cross-platform because Expo makes that free, but web is out of scope and nothing is checked against it.

## Requirements

- Node.js 20+
- Xcode with an iOS Simulator

## Get started

```bash
npm install
```

```bash
npm run ios
```

That starts Metro and opens the app in the iOS Simulator. Leave it running — the
usual workflow is one long-lived Metro instance that everything else attaches to,
rather than restarting it per change.

The `android` and `web` scripts still exist in `package.json` and will run, but
neither is a supported target: nothing is designed, checked, or fixed against
them.

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

```bash
npx expo export --platform ios --output-dir /tmp/unmapp-export
```

The export proves every import and route resolves, which the type checker does not.
After both pass, look at the screen you changed on the iOS Simulator — there is no
test suite, so seeing it render is the check. A web render does not count: it misses
native text metrics, safe-area insets, and the splash-screen handoff.

`npm run lint` runs `expo lint`, which prompts to install and configure ESLint the
first time it is used — do that before relying on it. There is no test setup yet; see
["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/) when one is needed.

## Docs

- [AGENTS.md](AGENTS.md) — how agents (and new contributors) should work in this repo.
- [Expo SDK 57 docs](https://docs.expo.dev/versions/v57.0.0/) — the versioned reference this repo is pinned to.
