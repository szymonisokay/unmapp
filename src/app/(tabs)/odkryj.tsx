import { useTranslation } from 'react-i18next';

import { Placeholder } from '@/components/Placeholder';

export default function Odkryj() {
  const { t } = useTranslation();

  return <Placeholder title={t('tabs.discover')} mockup="12-przewodnik" />;
}
