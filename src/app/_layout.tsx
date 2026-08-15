import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useAppFonts } from '@/design/fonts';
// Side-effect import: initialises i18next from the device language before any
// screen renders. See src/i18n/index.ts.
import '@/i18n';

// Must be called in global scope, not inside the component.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    // Hide on error too: rendering in a fallback face is bad, but hanging on
    // the splash screen forever is worse and looks like a crash.
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <Stack />;
}
