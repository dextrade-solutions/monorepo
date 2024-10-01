import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from '@mui/material';
import { DexUiProvider, useDexUI } from 'dex-ui';
import log from 'loglevel';
import { Provider, useSelector } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import AppHeader from './components/app/app-header';
import Web3ModalProvider from './components/app/web3-modal-provider';
import './css/index.scss';
import { I18nProvider } from './contexts/i18n';
import { getCurrentTheme } from './ducks/app/app';
import { getCurrentLocale } from './ducks/locale/locale';
import Pages from './pages';
import { persistor, store } from './store/store';

log.setLevel(log.levels.DEBUG);

export function ContentUi() {
  const theme = useSelector(getCurrentTheme);
  const locale = useSelector(getCurrentLocale);
  const { muiTheme } = useDexUI({ theme });
  return (
    <ThemeProvider theme={muiTheme}>
      <DexUiProvider theme={muiTheme} locale={locale}>
        <Web3ModalProvider>
          <CssBaseline />
          <AppHeader />
          <Container maxWidth="sm">
            <Box paddingY={3}>
              <Pages />
            </Box>
          </Container>
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
