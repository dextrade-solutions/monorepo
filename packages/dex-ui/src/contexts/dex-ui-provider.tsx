import { QueryClientProvider } from '@tanstack/react-query';
import { Theme, ThemeProvider } from '@mui/material';
// import CssBaseline from '@mui/material/CssBaseline';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import '../i18n';
import { ModalProvider } from '../components/app/modals';
import { queryClient } from 'dex-helpers/shared';

export const DexUiProvider = ({
  modals,
  children,
  theme,
  locale = 'en',
}: {
  children: React.ReactNode;
  theme: Theme;
  modals?: Record<string, React.ReactNode>;
  locale?: string;
}) => {
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [i18n, locale]);

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <ModalProvider modals={modals}>{children}</ModalProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
