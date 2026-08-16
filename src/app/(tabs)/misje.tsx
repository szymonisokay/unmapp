import { useTranslation } from 'react-i18next';

import { Placeholder } from '@/components/Placeholder';

export default function Misje() {
  const { t } = useTranslation();

  return <Placeholder title={t('tabs.missions')} mockup="13-misje" />;
}
