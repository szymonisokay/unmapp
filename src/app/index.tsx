import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Mark } from '@/components/Mark';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';

/**
 * Placeholder home screen, built on the design primitives so that it is a real
 * use of them rather than scaffolding. The map screen from
 * `app-design/v1/04-mapa.png` replaces this.
 *
 * "UNMAPP" is the brand and stays a literal — everything else comes from
 * `messages/pl.json` / `messages/en.json` through `t()`.
 */
export default function Index() {
  const { t } = useTranslation();

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <Mark size={72} progress={0.5} tone="cream" />
        <Text variant="eyebrow">UNMAPP</Text>
        <Text variant="display">{t('home.headline')}</Text>
        <Text variant="body">{t('home.placeholder')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    gap: spacing.md,
  },
});
