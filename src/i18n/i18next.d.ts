import 'i18next';

import type pl from '@/messages/pl.json';

/**
 * Teaches TypeScript the shape of our messages, so that `t()` accepts only keys
 * that exist and rejects typos.
 *
 * Polish is the source of truth: the key union is derived from `pl.json`. Add a
 * key there first, then to `messages/en.json`.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof pl;
    };
  }
}
