import { Theme, ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import '../i18n';
import { Modal } from '../components/app/modals';

export const DexUiProvider = ({
  extendedModals,
  children,
  theme,
  locale = 'en',
}: {
  extendedModals?: Record<string, React.ReactNode>;
  children: React.ReactNode;
  theme: Theme;
  locale: string;
}) => {
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [i18n, locale]);

  return (
    <ThemeProvider theme={theme}>
      <Modal extended={extendedModals} />
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
