import { ThemeProvider, CssBaseline } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { DexConnectProvider } from 'dex-connect';
import { DexUiProvider, useDexUI } from 'dex-ui';
import log from 'loglevel';
import React from 'react';

import './css/index.scss';
import App from './app';
import { SOLANA_CONNECT_API, SOLANA_CONNECT_WALLETS } from './solana-config';
import { config } from './web3-config';
import { AuthData } from '../app/types/auth';

log.setLevel(log.levels.DEBUG);

export function UI() {
  const [auth] = useLocalStorage<AuthData | null>('auth');
  const { muiTheme } = useDexUI({ theme: 'light' });

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <DexUiProvider theme={muiTheme} locale={auth?.lang}>
        <DexConnectProvider
          wagmiConfig={config}
          solanaConfig={{ SOLANA_CONNECT_API, SOLANA_CONNECT_WALLETS }}
        >
          <App />
        </DexConnectProvider>
      </DexUiProvider>
    </ThemeProvider>
  );
}
