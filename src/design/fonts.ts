import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';

/**
 * Font family names, as registered by `useAppFonts` below.
 *
 * These are working stand-ins for the faces used in `app-design/v1/`: a
 * high-contrast display serif for headlines and a geometric sans for body and
 * interface text. Both cover the Polish glyph set (ą ć ę ł ń ó ś ź ż). If the
 * design turns out to be authored with different families, this file and the
 * `typography` block in `./tokens` are the only places that change.
 */
export const fontFamily = {
  serif: 'PlayfairDisplay_400Regular',
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
  sans: 'Poppins_400Regular',
  sansSemiBold: 'Poppins_600SemiBold',
} as const;

/**
 * Loads every face the app uses. Returns `[loaded, error]`.
 *
 * Callers must keep the splash screen up until this reports done, otherwise
 * text renders in a system fallback face and then reflows once the real fonts
 * arrive.
 */
export function useAppFonts() {
  return useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });
}
