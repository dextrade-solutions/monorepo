import { Theme, ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import '../i18n';
import { ModalProvider } from '../components/app/modals';

export const DexUiProvider = ({
  modals,
  children,
  theme,
  locale = 'en',
}: {
  modals?: Record<string, React.ReactNode>;
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
      <ModalProvider modals={modals}>{children}</ModalProvider>
    </ThemeProvider>
  );
};
