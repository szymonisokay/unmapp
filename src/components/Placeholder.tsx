import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';

export interface PlaceholderProps {
  /** The screen's own name, e.g. the tab it sits behind. */
  title: string;
  /** Which mockup this screen is waiting for, e.g. `12-przewodnik`. */
  mockup: string;
}

/**
 * What a tab shows before its screen exists.
 *
 * A blank screen is indistinguishable from a crash or a failed render, so each
 * unbuilt tab says so out loud and names the mockup in `app-design/v1/` it is
 * waiting for. The app documents its own gaps.
 */
export function Placeholder({ title, mockup }: PlaceholderProps) {
  const { t } = useTranslation();

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.body}>
        <Text variant="eyebrow">{t('placeholder.eyebrow')}</Text>
        <Text variant="display">{title}</Text>
        <Text variant="body">{t('placeholder.waitingFor', { mockup })}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  body: {
    gap: spacing.md,
  },
});
