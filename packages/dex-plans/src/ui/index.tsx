import {
  Box,
  Container,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { enUS } from '@mui/material/locale';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useLocalStorage } from '@uidotdev/usehooks';
import { DexUiProvider, useDexUI } from 'dex-ui';
import log from 'loglevel';
import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import './css/index.scss';
import Pages from './pages';
import Palette from './palette';
import './i18n';
import { store } from './store/store';
import { AuthData } from '../app/types/auth';
import { ServiceBridge } from 'dex-services';

log.setLevel(log.levels.DEBUG);

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const queryClient = new QueryClient();

export function UI() {
  const [auth] = useLocalStorage<AuthData | null>('auth');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const paletteMode = auth?.theme || (prefersDarkMode ? 'dark' : 'light');
  const { muiTheme } = useDexUI({ theme: paletteMode });

  ServiceBridge.instance.init({
    customFetch: (fetchUrl, config) => {
      if (!auth) {
        throw new Error('no authenticated user');
      }
      const url = `${auth.apiversion}${new URL(fetchUrl).pathname}`;
      const isPublicUrl = String(url).includes('public/');
      if (!isPublicUrl) {
        config.headers['X-API-KEY'] = auth.apikey;
      }
      return fetch(url, config);
    },
  });

  const renderBody = () => (
    <>
      <Container maxWidth="sm">
        <Box paddingY={3}>
          <Pages />
        </Box>
      </Container>
    </>
  );

  return (
    <HashRouter>
      <Provider store={store}>
        <ThemeProvider theme={muiTheme}>
          <PersistQueryClientProvider
            persistOptions={{ persister }}
            client={queryClient}
          >
            <DexUiProvider theme={muiTheme} locale={auth?.lang}>
              {renderBody()}
            </DexUiProvider>
          </PersistQueryClientProvider>
        </ThemeProvider>
      </Provider>
    </HashRouter>
  );
}
