import { useTranslation } from 'react-i18next';

import { Placeholder } from '@/components/Placeholder';

export default function Profil() {
  const { t } = useTranslation();

  return <Placeholder title={t('tabs.profile')} mockup="14-profil" />;
}
