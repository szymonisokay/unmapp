// Hermes on iOS ships no `Intl.PluralRules`, and without it i18next resolves
// every count to the `_other` form — Polish then reads "5 odkrytego miejsca"
// instead of "5 odkrytych miejsc". This polyfill installs the CLDR rules and
// must be imported before i18next initialises. Verified on the simulator: with
// it removed, counts 2, 5 and 22 all collapse to one wrong form.
import 'intl-pluralrules';

import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/messages/en.json';
import pl from '@/messages/pl.json';

/**
 * Translation setup. Importing this module initialises i18next; it must happen
 * before the first screen renders, which is why `src/app/_layout.tsx` imports
 * it at the top of the file.
 *
 * The language comes from the device and cannot be changed inside the app.
 * There is no language picker and nothing is written to disk: iOS restarts the
 * app when its language setting changes, so following the system is enough.
 *
 * Copy lives in `messages/pl.json` and `messages/en.json`. Polish is the source
 * of truth for the key set — `src/i18n/i18next.d.ts` derives the type of every
 * key from `pl.json`, so `t('home.headlin')` is a compile error, and a key
 * added to Polish must be added to English or it silently falls back.
 */

export const SUPPORTED_LANGUAGES = ['pl', 'en'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** Used when the device speaks something we do not translate. */
export const FALLBACK_LANGUAGE: Language = 'en';

export const resources = {
  pl: { translation: pl },
  en: { translation: en },
} as const;

function isSupported(languageCode: string | null): languageCode is Language {
  return SUPPORTED_LANGUAGES.includes(languageCode as Language);
}

/**
 * The first device language we actually translate.
 *
 * `getLocales()` returns the user's preferred locales in order, so somebody
 * whose phone is set to German with Polish second gets Polish rather than the
 * English fallback.
 */
export function resolveDeviceLanguage(): Language {
  for (const locale of Localization.getLocales()) {
    if (isSupported(locale.languageCode)) {
      return locale.languageCode;
    }
  }

  return FALLBACK_LANGUAGE;
}

i18next.use(initReactI18next).init({
  resources,
  lng: resolveDeviceLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  // Both message files are bundled, so init finishes synchronously and no
  // screen ever waits on translations. Suspense would only add a boundary the
  // root layout does not have.
  react: { useSuspense: false },
  // Escaping guards against HTML injection in a browser. There is no HTML here
  // and the escaped output would show up literally in a <Text>.
  interpolation: { escapeValue: false },
});

export default i18next;
