import type { ExpoConfig } from 'expo/config';

/**
 * Expo config. This was `app.json` until the map landed.
 *
 * It is TypeScript rather than JSON for one reason: the Mapbox native SDK may
 * need a secret download token, and that token is a config plugin option. JSON
 * cannot read the environment, so the secret would have to be committed — and
 * `npx expo prebuild` would then copy it onward into `ios/Podfile`. Here it
 * comes from `.env.local`, which `.gitignore` already covers.
 *
 * Expo's CLI loads `.env.local` before evaluating this file, so
 * `process.env` is populated by the time it runs. Names and their meaning are
 * documented in `.env.example`.
 */

/**
 * Secret token with the `DOWNLOADS:READ` scope, used only while building to
 * fetch Mapbox's native SDK. Never reaches the JavaScript bundle. Some Mapbox
 * SDK versions no longer need it, which is why it is optional here rather than
 * a hard requirement — if the build fails with a 401 or 403 while downloading
 * the SDK, this is what is missing.
 */
const mapboxDownloadToken = process.env.MAPBOX_DOWNLOAD_TOKEN;

const config: ExpoConfig = {
  name: 'unmapp',
  slug: 'unmapp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'unmapp',
  userInterfaceStyle: 'light',
  ios: {
    icon: './assets/expo.icon',
    // Permanent once the app ships — see the Decision Log in
    // docs/exec-plans/ for why it is a personal rather than a company namespace.
    bundleIdentifier: 'com.szymonwalach.unmapp',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  // No `web` block on purpose. It used to say `output: 'static'`, which made the
  // dev server eagerly build a web and a server-rendering bundle on every start
  // — and those fail, because `@rnmapbox/maps` pulls in `mapbox-gl` on web and
  // that package is not installed. Installing it would mean maintaining a
  // browser map for a platform this repo explicitly does not support. Removing
  // the target is the honest fix: the config now says what AGENTS.md says.
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    'expo-localization',
    [
      'expo-location',
      {
        // iOS reads this string from the built app, so it cannot go through
        // our i18n setup — it is baked in at build time and shown in whatever
        // language it was written. Polish, to match the app's primary audience.
        locationWhenInUsePermission:
          'Unmapp pokazuje Twoją pozycję na mapie i proponuje miejsca w pobliżu.',
      },
    ],
    ['@rnmapbox/maps', mapboxDownloadToken ? { RNMapboxMapsDownloadToken: mapboxDownloadToken } : {}],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
