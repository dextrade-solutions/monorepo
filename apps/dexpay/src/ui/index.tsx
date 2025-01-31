import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'dex-helpers/shared';
import { DexUiProvider, useDexUI } from 'dex-ui';
import log from 'loglevel';
import React from 'react';
import { Switch, Route } from 'wouter';

import Appbar from './app-bar';
import BottomNav from './components/layout/BottomNav';
import {
  ROUTE_HISTORY,
  ROUTE_HOME,
  ROUTE_INVOICE_CREATE,
  ROUTE_INVOICE_EDIT,
  ROUTE_MERCHANT,
  ROUTE_P2P,
  ROUTE_PROFILE,
} from './constants/pages';
import { UserProvider } from './contexts/user-context';
import { useQuery } from './hooks/use-query';
import SelectProject from './modals/select-project';
import CreateInvoice from './pages/CreateInvoice';
import Merchant from './pages/Merchant';
import NotFound from './pages/not-found';
import P2P from './pages/P2P';
import Profile from './pages/Profile';
import TransactionHistory from './pages/TransactionHistory';

import './css/index.scss';
import Wallet from './pages/Wallet';
import { saveAuthToken } from './services/client';

log.setLevel(log.levels.DEBUG);

function Router() {
  return (
    <Switch>
      <Route path={ROUTE_HOME} component={Wallet} />
      <Route path={ROUTE_MERCHANT} component={Merchant} />
      <Route path={ROUTE_INVOICE_CREATE} component={CreateInvoice} />
      <Route path={ROUTE_INVOICE_EDIT} component={CreateInvoice} />
      <Route path={ROUTE_P2P} component={P2P} />
      <Route path={ROUTE_HISTORY} component={TransactionHistory} />
      <Route path={ROUTE_PROFILE} component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

saveAuthToken(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9pZCI6OTMwMywidHlwZSI6ImFjY2VzcyIsInRva2VuIjoiVkN4MlZXR29tNndsdDNhZ0RDSERVUzdoTFdqN1NTRDllczY2bU9ka0w5c1JrS3ZrVU1vX2dZbHh6TDNnX2lmOFpsQSIsImlhdCI6MTczODMyNTAwMSwiZXhwIjoxNzM4MzMyMjAxfQ.CtB6LtOznK6EMegVTlBo_41EFGx7FC6tH6W7xOXrtjI',
);

export function UI() {
  const { muiTheme } = useDexUI();

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <DexUiProvider
        theme={muiTheme}
        modals={{
          SELECT_PROJECT: SelectProject,
        }}
      >
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <Container maxWidth="sm">
              <Appbar />
              <Box mb={10}>
                <Router />
              </Box>
              <BottomNav />
            </Container>
          </UserProvider>
        </QueryClientProvider>
      </DexUiProvider>
    </ThemeProvider>
  );
}
