import { Theme, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'dex-helpers/shared';
// import CssBaseline from '@mui/material/CssBaseline';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { LoaderProvider } from './loader';
import { ModalProvider } from '../components/app/modals';
import '../i18n';

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
      <LoaderProvider>
        <QueryClientProvider client={queryClient}>
          <ModalProvider modals={modals}>{children}</ModalProvider>
        </QueryClientProvider>
      </LoaderProvider>
    </ThemeProvider>
  );
};
