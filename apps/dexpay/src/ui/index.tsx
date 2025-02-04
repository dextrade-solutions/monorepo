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
import SelectProject from './modals/select-project';
import CreateInvoice from './pages/CreateInvoice';
import Merchant from './pages/Merchant';
import NotFound from './pages/not-found';
import P2P from './pages/P2P';
import Profile from './pages/Profile';
import TransactionHistory from './pages/TransactionHistory';

import './css/index.scss';
import Wallet from './pages/Wallet';

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

export function UI() {
  const { muiTheme } = useDexUI();

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <DexUiProvider
            theme={muiTheme}
            modals={{
              SELECT_PROJECT: SelectProject,
            }}
          >
            <Container maxWidth="sm">
              <Appbar />
              <Box mb={10}>
                <Router />
              </Box>
              <BottomNav />
            </Container>
          </DexUiProvider>
        </UserProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
