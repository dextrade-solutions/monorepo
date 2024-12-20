import {
  Box,
  Container,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useLocalStorage } from '@uidotdev/usehooks';
import { ServiceBridge } from 'dex-services';
import { DexUiProvider, useDexUI } from 'dex-ui';
import log from 'loglevel';
import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import './css/index.scss';
import Pages from './pages';
import './i18n';
import { store } from './store/store';
import { AuthData } from '../app/types/auth';

log.setLevel(log.levels.DEBUG);

// const persister = createSyncStoragePersister({
//   storage: window.localStorage,
// });

export function UI() {
  const [auth] = useLocalStorage<AuthData | null>('auth');
  const { muiTheme } = useDexUI({ theme: auth?.theme });

  ServiceBridge.instance.init({
    customFetch: (fetchUrl, config) => {
      const url = `${auth.apiversion}${new URL(fetchUrl).pathname}`;
      const isPublicUrl = String(url).includes('public/');
      if (!isPublicUrl) {
        if (!auth) {
          throw new Error('no authenticated user');
        }
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
          <CssBaseline />
          <DexUiProvider theme={muiTheme} locale={auth?.lang}>
            {renderBody()}
          </DexUiProvider>
        </ThemeProvider>
      </Provider>
    </HashRouter>
  );
}
