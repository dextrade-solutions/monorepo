import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'dex-helpers/shared';
import { DexUiProvider, useDexUI } from 'dex-ui';
import log from 'loglevel';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { registerSW } from 'virtual:pwa-register';

import { GradientFluid } from './components/GradientFluid';
import { LayoutDefault } from './components/layouts';
import { UserProvider } from './contexts/user-context';
import { useAuth } from './hooks/use-auth';
import PickCoinModal from './modals/pick-coin';
import SalespersonsModal from './modals/salespersons';
import SelectProject from './modals/select-project';
import ShortcutNewInvoice from './modals/shortcut-new-invoice';
import TransactionsModal from './modals/transactions';
import Router from './router';
import './css/index.scss';

const updateSW = registerSW({
  swUrl: `/sw.js?v=${__APP_VERSION__}`,
  onNeedRefresh() {
    if (confirm('A new version is available. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});

log.setLevel(log.levels.DEBUG);

function App() {
  const { isAuthorized } = useAuth();
  if (!isAuthorized) {
    return (
      <>
        <Box
          position="absolute"
          sx={{
            top: -30,
            left: 0,
            overflow: 'hidden',
          }}
        >
          <GradientFluid />
        </Box>
        <Box
          sx={{
            display: 'flex',
            pt: 10,
            flexDirection: 'column',
            height: '100vh', // Make container take up full viewport height
            justifyContent: 'center', // Vertically center content
            alignItems: 'center', // Horizontally center content
          }}
        >
          <Router />
        </Box>
      </>
    );
  }
  return (
    <LayoutDefault>
      <Router />
    </LayoutDefault>
  );
}

export function UI() {
  const { muiTheme } = useDexUI({ theme: 'light' });

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <DexUiProvider
            theme={muiTheme}
            modals={{
              PICK_COIN: PickCoinModal,
              SELECT_PROJECT: SelectProject,
              SALESPERSONS: SalespersonsModal,
              DEXPAY_TRANSACTIONS_LIST: TransactionsModal,
              SHORTCUT_NEW_INVOICE: ShortcutNewInvoice,
            }}
          >
            <SnackbarProvider>
              <App />
            </SnackbarProvider>
          </DexUiProvider>
        </UserProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
