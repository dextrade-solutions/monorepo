import {
  Box,
  Container,
  ThemeProvider,
  CssBaseline,
  Typography,
  Button,
} from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import { DexUiProvider, useDexUI, Invoice } from 'dex-ui';
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

  // State to store the extracted ID
  // const [invoiceId, setInvoiceId] = useState<string | null>(null);

  // Extract ID from the URL
  const pathParts = window.location.pathname.split('/');
  const invoiceId = pathParts[pathParts.length - 1];

  const handleBackButtonClick = () => {
    // Navigate to the previous page
    window.history.back();
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <DexUiProvider theme={muiTheme} locale={auth?.lang}>
        <Container maxWidth="sm">
          <Box paddingY={3}>
            {invoiceId ? (
              <Invoice
                id={invoiceId}
                wagmiConfig={config}
                solana={{
                  SOLANA_CONNECT_WALLETS,
                  SOLANA_CONNECT_API,
                }}
                onBack={window.history.length > 1 && handleBackButtonClick}
              />
            ) : (
              <>
                <Typography textAlign="center" variant="h3" fontWeight="bold">
                  404
                </Typography>
                <Typography textAlign="center" variant="h6">
                  Oops! Invoice Not Found
                </Typography>
              </>
            )}
          </Box>
        </Container>
      </DexUiProvider>
    </ThemeProvider>
  );
}
