import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import { DexUiProvider, useDexUI } from 'dex-ui';
import log from 'loglevel';
import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { HashRouter, useLocation } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import AppHeader from './components/app/app-header';
import Web3ModalProvider from './components/app/web3-modal-provider';
import Web3SolanaProvider from './components/app/web3-solana-provider/web3-solana-provider';
import { I18nProvider } from './contexts/i18n';
import { getCurrentTheme } from './ducks/app/app';
import { getCurrentLocale } from './ducks/locale/locale';
import { AWAITING_SWAP_ROUTE } from './helpers/constants/routes';
import Pages from './pages';
import { persistor, store } from './store/store';

import './css/index.scss';

log.setLevel(log.levels.DEBUG);

export function ContentUi() {
  const location = useLocation();
  const theme = useSelector(getCurrentTheme);
  const locale = useSelector(getCurrentLocale);
  const { muiTheme } = useDexUI({ theme });
  const hideHeader = location.pathname.includes(AWAITING_SWAP_ROUTE);
  return (
    <ThemeProvider theme={muiTheme}>
      <DexUiProvider theme={muiTheme} locale={locale}>
        <Web3ModalProvider>
          <Web3SolanaProvider>
            <CssBaseline />
            {!hideHeader && <AppHeader />}
            <Container maxWidth="sm">
              <Box paddingY={3}>
                <Pages />
              </Box>
            </Container>
          </Web3SolanaProvider>
        </Web3ModalProvider>
      </DexUiProvider>
    </ThemeProvider>
  );
}

export function Ui() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HashRouter>
          <I18nProvider>
            <ContentUi />
          </I18nProvider>
        </HashRouter>
      </PersistGate>
    </Provider>
  );
}
