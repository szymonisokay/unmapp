import Mapbox from '@rnmapbox/maps'

/**
 * Which Mapbox style the map draws with.
 *
 * The cream cartography from `app-design/v1/04-mapa.png` is authored as
 * `map-style/unmapp-cream.json`, uploaded to Mapbox Studio by hand, and
 * referenced here by the URL Studio hands back. Keeping the URL in the
 * environment rather than in this file means a second style — a dark variant, a
 * work-in-progress draft, an English-labelled one — is a change to `.env.local`
 * rather than a commit.
 *
 * The fallback is a stock Mapbox style. It exists so that a fresh clone with no
 * `.env.local` still renders a map instead of a blank rectangle; it does not
 * look like the design, which is what the warning below is for.
 */
const styleUrl = process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL

if (__DEV__ && !styleUrl) {
	console.warn(
		'EXPO_PUBLIC_MAPBOX_STYLE_URL is not set — falling back to a stock Mapbox style, ' +
			'so the map will not look like the design. Copy .env.example to .env.local and ' +
			'paste the style URL from Mapbox Studio, then restart Metro.',
	)
}

export const MAP_STYLE_URL: string = styleUrl ?? Mapbox.StyleURL.Light

/**
 * Where the camera points when we do not know where the user is — because they
 * refused permission, or the device has no fix yet.
 *
 * Katowice, since that is the city the fixture discoveries in
 * `src/data/in-memory-repository.ts` belong to. Note the order: Mapbox takes
 * `[longitude, latitude]`, the reverse of how coordinates are usually spoken.
 */
export const FALLBACK_CAMERA = {
	centerCoordinate: [19.0238, 50.2649] as [number, number],
	zoomLevel: 12,
}
