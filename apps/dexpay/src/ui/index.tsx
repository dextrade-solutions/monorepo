import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'dex-helpers/shared';
import { DexUiProvider, useDexUI } from 'dex-ui';
import log from 'loglevel';
import { SnackbarProvider } from 'notistack';
import React, { useEffect } from 'react';
import { Switch, Route, useLocation } from 'wouter';

import Appbar from './app-bar';
import { GradientFluid } from './components/GradientFluid';
import BottomNav from './components/layout/BottomNav';
import {
  ROUTE_HISTORY,
  ROUTE_HOME,
  ROUTE_INVOICE_CREATE,
  ROUTE_INVOICE_EDIT,
  ROUTE_LOGIN,
  ROUTE_MERCHANT,
  ROUTE_P2P,
  ROUTE_PROFILE,
  ROUTE_REGISTER,
  ROUTE_WALLET_DEPOSIT,
  ROUTE_WALLET_WITHDRAW,
} from './constants/pages';
import { UserProvider } from './contexts/user-context';
import { useAuth } from './hooks/use-auth';
import SalespersonsModal from './modals/salespersons';
import SelectProject from './modals/select-project';
import TransactionsModal from './modals/transactions';
import LoginForm from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import CreateInvoice from './pages/CreateInvoice';
import Merchant from './pages/Merchant';
import NotFound from './pages/not-found';
import P2P from './pages/P2P';
import Profile from './pages/Profile';
import TransactionHistory from './pages/TransactionHistory';
import Wallet from './pages/Wallet';
import WalletDepositPage from './pages/WalletDeposit';
import WalletMemo from './pages/WalletMemo';
import WalletWithdrawPage from './pages/WalletWithdraw';
import './css/index.scss';

log.setLevel(log.levels.DEBUG);

function Router() {
  const auth = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (
      !auth.isAuthorized ||
      (auth.user && !auth.user.isRegistrationCompleted)
    ) {
      navigate('/');
    }
  }, []);

  if (!auth.isAuthorized) {
    return (
      <Switch>
        <Route path={ROUTE_LOGIN} component={LoginForm} />
        <Route path={ROUTE_REGISTER} component={SignUp} />
      </Switch>
    );
  } else if (auth.user && !auth.user.isRegistrationCompleted) {
    return <Route path={'/'} component={WalletMemo} />;
  }

  return (
    <Switch>
      <Route path={ROUTE_HOME} component={Wallet} />
      <Route path={ROUTE_WALLET_DEPOSIT} component={WalletDepositPage} />
      <Route path={ROUTE_WALLET_WITHDRAW} component={WalletWithdrawPage} />
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
    <Container maxWidth="sm">
      <Appbar />
      <Box mb={10}>
        <Router />
      </Box>
      <BottomNav />
    </Container>
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
              SELECT_PROJECT: SelectProject,
              SALESPERSONS: SalespersonsModal,
              DEXPAY_TRANSACTIONS_LIST: TransactionsModal,
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
