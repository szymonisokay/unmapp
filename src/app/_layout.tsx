import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { useAppFonts } from '@/design/fonts'
// Side-effect import: initialises i18next from the device language before any
// screen renders. See src/i18n/index.ts.
import '@/i18n'

// Must be called in global scope, not inside the component.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
	const [fontsLoaded, fontError] = useAppFonts()

	useEffect(() => {
		// Hide on error too: rendering in a fallback face is bad, but hanging on
		// the splash screen forever is worse and looks like a crash.
		if (fontsLoaded || fontError) {
			SplashScreen.hideAsync()
		}
	}, [fontsLoaded, fontError])

	if (!fontsLoaded && !fontError) {
		return null
	}

	// GestureHandlerRootView has to sit above everything for pan and tap gestures
	// to be delivered at all — expo-router does not mount it for us, and without
	// it the bottom sheet on the map screen silently refuses to move.
	//
	// No header anywhere: the map in `app-design/v1/04-mapa.png` runs edge to
	// edge under the status bar, and every other screen draws its own title.
	return (
		<GestureHandlerRootView style={styles.root}>
			<Stack screenOptions={{ headerShown: false }} />
		</GestureHandlerRootView>
	)
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
})
