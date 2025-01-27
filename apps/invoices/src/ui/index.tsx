import {
  Box,
  Container,
  ThemeProvider,
  CssBaseline,
  Typography,
  Button,
} from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { DexUiProvider, Icon, useDexUI, Invoice } from 'dex-ui';
import log from 'loglevel';
import React from 'react';

import './css/index.scss';
import { SOLANA_CONNECT_API, SOLANA_CONNECT_WALLETS } from './solana-config';
import { config } from './web3-config';
import { AuthData } from '../app/types/auth';

log.setLevel(log.levels.DEBUG);

export function UI() {
  const [auth] = useLocalStorage<AuthData | null>('auth');
  const { muiTheme } = useDexUI({ theme: 'light' });

  const backbutton = (
    <Button
      startIcon={<Icon name="arrow-left-dex" />}
      color="secondary"
      variant="contained"
      onClick={() => {}}
    >
      Back
    </Button>
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <DexUiProvider theme={muiTheme} locale={auth?.lang}>
        <Container maxWidth="sm">
          <Box paddingY={3}>
            <Box display="flex" justifyContent="space-between" m={1} mb={2}>
              <Typography variant="h5">
                Dex<strong>Pay</strong>
              </Typography>
              {backbutton}
            </Box>
            <Invoice
              wagmiConfig={config}
              solana={{
                SOLANA_CONNECT_WALLETS,
                SOLANA_CONNECT_API,
              }}
            />
          </Box>
        </Container>
      </DexUiProvider>
    </ThemeProvider>
  );
}
