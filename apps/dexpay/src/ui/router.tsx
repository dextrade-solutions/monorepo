import React, { useEffect } from 'react';
import { Router as Wouter, Route } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';

import {
  ROUTE_HISTORY,
  ROUTE_HOME,
  ROUTE_INVOICE_CREATE,
  ROUTE_INVOICE_DETAIL,
  ROUTE_INVOICE_EDIT,
  ROUTE_LOGIN,
  ROUTE_MERCHANT,
  ROUTE_P2P,
  ROUTE_P2P_CREATE,
  ROUTE_PROFILE,
  ROUTE_REGISTER,
  ROUTE_WALLET_DEPOSIT,
  ROUTE_WALLET_WITHDRAW,
} from './constants/pages';
import { useAuth } from './hooks/use-auth';
import LoginForm from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import CreateInvoice from './pages/CreateInvoice';
import Merchant from './pages/Merchant';
import InvoiceDetailPage from './pages/MerchantInvoiceDetail';
import NotFound from './pages/not-found';
import P2P from './pages/P2P';
import P2PCreate from './pages/P2PCreate';
import Profile from './pages/Profile';
import Terminal from './pages/Terminal';
import TransactionHistory from './pages/TransactionHistory';
import Wallet from './pages/Wallet';
import WalletDepositPage from './pages/WalletDeposit';
import WalletMemo from './pages/WalletMemo';
import WalletWithdrawPage from './pages/WalletWithdraw';

export default function Router() {
  const auth = useAuth();
  const [location, navigate] = useHashLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

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
      <Wouter hook={useHashLocation}>
        <Route path={ROUTE_LOGIN} component={LoginForm} />
        <Route path={ROUTE_REGISTER} component={SignUp} />
      </Wouter>
    );
  } else if (auth.user && !auth.user.isRegistrationCompleted) {
    return <Route path={'/'} component={WalletMemo} />;
  }

  return (
    <Wouter hook={useHashLocation}>
      <Route
        path={ROUTE_HOME}
        component={auth.user?.isCashier ? Terminal : Wallet}
      />
      <Route path={ROUTE_WALLET_DEPOSIT} component={WalletDepositPage} />
      <Route path={ROUTE_WALLET_WITHDRAW} component={WalletWithdrawPage} />
      <Route path={ROUTE_MERCHANT} component={Merchant} />
      <Route path={ROUTE_INVOICE_DETAIL}>
        <InvoiceDetailPage />
      </Route>
      <Route path={ROUTE_INVOICE_CREATE} component={CreateInvoice} />
      <Route path={ROUTE_INVOICE_EDIT} component={CreateInvoice} />
      <Route path={ROUTE_P2P} component={P2P} />
      <Route path={ROUTE_P2P_CREATE} component={P2PCreate} />
      <Route path={ROUTE_HISTORY} component={TransactionHistory} />
      <Route path={ROUTE_PROFILE} component={Profile} />
    </Wouter>
  );
}
