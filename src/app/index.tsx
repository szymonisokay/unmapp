import { StyleSheet, View } from 'react-native';

import { Mark } from '@/components/Mark';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';

/**
 * Placeholder home screen, built on the design primitives so that it is a real
 * use of them rather than scaffolding. The map screen from
 * `app-design/v1/04-mapa.png` replaces this.
 */
export default function Index() {
  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <Mark size={72} progress={0.5} tone="cream" />
        <Text variant="eyebrow">UNMAPP</Text>
        <Text variant="display">Odkryj to, czego nie ma na Twojej mapie</Text>
        <Text variant="body">Ekrany aplikacji jeszcze nie istnieją.</Text>
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
