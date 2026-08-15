import type { TextStyle } from 'react-native';

import { fontFamily } from './fonts';

/**
 * Every design value in the app lives here.
 *
 * Colours were sampled directly from the mockups in `app-design/v1/` and are
 * exact. Spacing, radii, and type sizes were estimated from those mockups and
 * may be adjusted once the first real screen is built.
 */
export const colors = {
  /** Page background, every screen. */
  background: '#F7F4EE',
  /** White cards sitting on that background. */
  surface: '#FFFDF8',
  /** Primary text, and the fill of the dark card in 13-misje. */
  ink: '#17150F',
  /** Primary buttons, selected chips, progress fill. */
  accent: '#FFAD5F',
  /** The "Discovery Challenge" card in 13-misje. */
  accentSoft: '#FFDFC0',
  /** Secondary text, captions, eyebrow labels. */
  textMuted: '#8A8071',
  /** Unselected chip labels. */
  textSecondary: '#5C5548',
  /** Hairlines and unselected chip outlines. */
  border: '#E5E3DD',
  /** Unfilled part of a progress bar. */
  track: '#E5E3DD',
  /** Destructive actions, e.g. "Usuń konto" in 18-ustawienia. */
  danger: '#9A3B2C',
  /** The green glow around the user's position on the map. */
  mapHalo: '#CFDCC0',
  /** The blue position dot. */
  locationDot: '#488ACB',
} as const;

export type ColorToken = keyof typeof colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  tile: 16,
  card: 20,
  pill: 999,
} as const;

/**
 * The type ramp seen across the mockups.
 *
 * `display` is the serif used for screen headlines ("Jak daleko dziś?").
 * `title` is the same serif at card scale ("Ukryty punkt widokowy").
 * `body` is the sans used for running text.
 * `label` is the sans used on buttons and chips.
 * `caption` is the small muted sans used for metadata ("8 sierpnia · 23 km").
 * `eyebrow` is the small uppercase letter-spaced sans above a headline
 * ("ZASIĘG", "KROK 1 Z 3").
 */
export const typography = {
  display: {
    fontFamily: fontFamily.serif,
    fontSize: 34,
    lineHeight: 41,
    color: colors.ink,
  },
  title: {
    fontFamily: fontFamily.serif,
    fontSize: 26,
    lineHeight: 32,
    color: colors.ink,
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.ink,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  eyebrow: {
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
