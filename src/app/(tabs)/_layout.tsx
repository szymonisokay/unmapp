import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'

import { TabIcon } from '@/components/navigation/TabIcon'
import { fontFamily } from '@/design/fonts'
import { colors } from '@/design/tokens'

/**
 * The four-tab bar along the bottom of `app-design/v1/04-mapa.png`.
 *
 * `(tabs)` in the directory name is a route *group*: the parentheses keep it
 * out of the URL, so the map screen inside it is `/` rather than `/tabs`.
 *
 * This uses expo-router's JavaScript `Tabs` rather than the native tabs API
 * that SDK 57 also offers, because the design is a flat cream bar with custom
 * geometric icons. A native iOS tab bar renders as a system material with SF
 * Symbols and cannot be made to look like this.
 */
export default function TabsLayout() {
	const { t } = useTranslation()

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: colors.ink,
				tabBarInactiveTintColor: colors.textMuted,
				tabBarStyle: styles.bar,
				tabBarLabelStyle: styles.label,
			}}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: t('tabs.map'),
					tabBarIcon: ({ color }) => (
						<TabIcon shape='square' color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name='odkryj'
				options={{
					title: t('tabs.discover'),
					tabBarIcon: ({ color }) => (
						<TabIcon shape='circle' color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name='misje'
				options={{
					title: t('tabs.missions'),
					tabBarIcon: ({ color }) => (
						<TabIcon shape='diamond' color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name='profil'
				options={{
					title: t('tabs.profile'),
					tabBarIcon: ({ color }) => (
						<TabIcon shape='circle' color={color} />
					),
				}}
			/>
		</Tabs>
	)
}

const styles = StyleSheet.create({
	bar: {
		backgroundColor: colors.surface,
		borderTopColor: colors.border,
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	label: {
		fontFamily: fontFamily.sans,
		fontSize: 12,
	},
})
