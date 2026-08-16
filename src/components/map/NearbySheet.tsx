import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	StyleSheet,
	View,
	useWindowDimensions,
	type LayoutChangeEvent,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated'

import { PillButton } from '@/components/PillButton'
import { Text } from '@/components/Text'
import { colors, radius, spacing } from '@/design/tokens'

/**
 * How much of the sheet stays on screen when it is closed: the grab handle and
 * the "Dziś w pobliżu" label, nothing more.
 *
 * Exported because the map has to know it — the Mapbox logo and attribution are
 * positioned just above this line so they stay visible, which is a requirement
 * of Mapbox's terms rather than a matter of taste.
 */
export const COLLAPSED_SHEET_HEIGHT = 88

/**
 * A ceiling, not a target. The sheet is as tall as its content, but content it
 * cannot yet anticipate — a list of suggestions, say — must not produce a sheet
 * taller than the screen, which would be impossible to close. If this limit is
 * ever reached the answer is to make the body scroll, not to raise it.
 */
const MAX_HEIGHT_FRACTION = 0.85

/** Flick faster than this (points per second) commits to a direction. */
const FLICK_VELOCITY = 400

/**
 * `overshootClamping` is not decoration — it is what stops the sheet from
 * opening into a gap.
 *
 * The open position is `translateY: 0`, and the sheet is anchored to the bottom
 * edge. An underdamped spring overshoots its target, so it would carry the sheet
 * past zero into negative translation: the card lifts off the bottom and the map
 * shows through underneath it, between the card and the tab bar. Clamping ends
 * the animation at the target instead of oscillating around it.
 *
 * With that guaranteed, the damping can stay low enough to feel quick. Raise it
 * toward 28 (critical damping for this stiffness) for a softer, slower landing.
 */
const SPRING = { damping: 20, stiffness: 200, overshootClamping: true } as const

export interface NearbySheetProps {
	/**
	 * Explains why the map is not centred on the user, when that is the case.
	 * Absent on the happy path.
	 */
	note?: string
	onSurpriseMe?: () => void
	onFilters?: () => void
}

/**
 * The bottom card of `app-design/v1/04-mapa.png`, turned into a sheet that
 * pulls up from the bottom edge.
 *
 * As a fixed card it ate roughly half the screen, which is the wrong trade on a
 * screen whose subject is the map. Closed, it is a strip with a centred handle;
 * dragging it — or tapping the handle — opens it to exactly the height its
 * content needs, measured at layout time rather than assumed.
 *
 * The gesture is attached to the header strip only, not the whole sheet, so the
 * buttons stay pressable and drags that begin on the map still pan the map.
 */
export function NearbySheet({
	note,
	onSurpriseMe,
	onFilters,
}: NearbySheetProps) {
	const { t } = useTranslation()
	const { height: screenHeight } = useWindowDimensions()

	// Null until the first layout pass. The sheet's height comes from its content,
	// so it cannot be known before the content has been laid out — and until then
	// there is no way to work out how far down "closed" is.
	const [sheetHeight, setSheetHeight] = useState<number | null>(null)
	const [open, setOpen] = useState(false)

	const offset = useSharedValue(0)
	const offsetAtDragStart = useSharedValue(0)

	const closedOffset =
		sheetHeight === null ? 0 : sheetHeight - COLLAPSED_SHEET_HEIGHT

	function handleLayout(event: LayoutChangeEvent) {
		const measured = event.nativeEvent.layout.height

		// Sub-pixel jitter would otherwise re-render on every layout pass.
		if (sheetHeight !== null && Math.abs(measured - sheetHeight) < 1) {
			return
		}

		setSheetHeight(measured)

		// Snap rather than animate: this fires on the first layout and whenever the
		// content changes height (the location note appearing, for instance). An
		// animation here would look like the sheet moving on its own.
		if (!open) {
			offset.value = measured - COLLAPSED_SHEET_HEIGHT
		}
	}

	const drag = Gesture.Pan()
		.onStart(() => {
			offsetAtDragStart.value = offset.value
		})
		.onUpdate((event) => {
			// Clamped so the sheet cannot be thrown past either end.
			offset.value = Math.min(
				closedOffset,
				Math.max(0, offsetAtDragStart.value + event.translationY),
			)
		})
		.onEnd((event) => {
			// A deliberate flick wins over position; otherwise the sheet goes
			// wherever it is already closest to.
			const opening =
				event.velocityY < -FLICK_VELOCITY ||
				(event.velocityY < FLICK_VELOCITY &&
					offset.value < closedOffset / 2)

			offset.value = withSpring(opening ? 0 : closedOffset, SPRING)
			runOnJS(setOpen)(opening)
		})

	const toggle = Gesture.Tap().onEnd(() => {
		const opening = offset.value > closedOffset / 2

		offset.value = withSpring(opening ? 0 : closedOffset, SPRING)
		runOnJS(setOpen)(opening)
	})

	// Pan takes priority: a press that never moves falls through to the tap.
	const headerGesture = Gesture.Exclusive(drag, toggle)

	const sheetStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: offset.value }],
	}))

	return (
		<Animated.View
			onLayout={handleLayout}
			style={[
				styles.sheet,
				{ maxHeight: Math.round(screenHeight * MAX_HEIGHT_FRACTION) },
				sheetStyle,
				// For one frame the sheet sits at full height with nowhere to hide,
				// because "closed" is not known until it has been measured. Hiding it
				// for that frame is cheaper than letting it flash open.
				sheetHeight === null ? styles.unmeasured : null,
			]}
		>
			<GestureDetector gesture={headerGesture}>
				<View
					style={styles.header}
					// Without this React Native flattens the view away — it carries only
					// layout styles — and the gesture ends up attached to the whole sheet,
					// so dragging anywhere on the card moves it, buttons included.
					collapsable={false}
					accessibilityRole='button'
					accessibilityLabel={t('map.nearbyEyebrow')}
					accessibilityHint={t('map.sheetHint')}
				>
					<View style={styles.handle} />
					<Text variant='eyebrow'>{t('map.nearbyEyebrow')}</Text>
				</View>
			</GestureDetector>

			<View style={styles.body}>
				<Text variant='display'>{t('map.nearbyHeadline')}</Text>
				{note ? <Text variant='caption'>{note}</Text> : null}

				<View style={styles.actions}>
					<PillButton
						label={t('map.surpriseMe')}
						onPress={onSurpriseMe}
						style={styles.primary}
					/>
					<PillButton
						label={t('map.filters')}
						variant='secondary'
						onPress={onFilters}
					/>
				</View>
			</View>
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	sheet: {
		position: 'absolute',
		bottom: 0,
		backgroundColor: colors.surface,
		borderTopLeftRadius: radius.card,
		borderTopRightRadius: radius.card,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
		overflow: 'hidden',
	},
	unmeasured: {
		opacity: 0,
	},
	header: {
		// The whole strip is the target, so the handle is easy to hit even though
		// the visible grabber is small.
		height: COLLAPSED_SHEET_HEIGHT,
		paddingHorizontal: spacing.xl,
		justifyContent: 'center',
		gap: spacing.md,
	},
	handle: {
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: colors.border,
		alignSelf: 'center',
	},
	body: {
		paddingHorizontal: spacing.xl,
		paddingBottom: spacing.xl,
		gap: spacing.md,
	},
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		marginTop: spacing.sm,
	},
	primary: {
		flex: 1,
	},
})
