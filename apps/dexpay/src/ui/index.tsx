import {
  Box,
  Container,
  ThemeProvider,
  CssBaseline,
  Typography,
  Button,
  Switch,
} from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { useLocalStorage } from '@uidotdev/usehooks';
import { queryClient } from 'dex-helpers/shared';
import { DexUiProvider, Icon, useDexUI } from 'dex-ui';
import log from 'loglevel';
import React, { useState, useEffect } from 'react';

import BottomNav from './components/layout/BottomNav';
import Merchant from './pages/Merchant';
import NotFound from './pages/not-found';
import P2P from './pages/P2P';
import Profile from './pages/Profile';
import TransactionHistory from './pages/TransactionHistory';
import Wallet from './pages/Wallet';

import './css/index.scss';

log.setLevel(log.levels.DEBUG);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Wallet} />
      <Route path="/merchant" component={Merchant} />
      <Route path="/p2p" component={P2P} />
      <Route path="/history" component={TransactionHistory} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

export function UI() {
  const { muiTheme } = useDexUI();

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <DexUiProvider theme={muiTheme}>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-background pb-16">
            <Router />
            <BottomNav />
          </div>
        </QueryClientProvider>
      </DexUiProvider>
    </ThemeProvider>
  );
}
