import React, { useEffect } from 'react';
import { Router as Wouter, Route } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';

import {
  ROUTE_FORGOT_PASSWORD,
  ROUTE_HISTORY,
  ROUTE_HOME,
  ROUTE_INVOICE_CREATE,
  ROUTE_INVOICE_DETAIL,
  ROUTE_INVOICE_EDIT,
  ROUTE_LOGIN,
  ROUTE_MERCHANT,
  ROUTE_P2P,
  ROUTE_P2P_CREATE,
  ROUTE_P2P_EDIT,
  ROUTE_PROFILE,
  ROUTE_REGISTER,
  ROUTE_WALLET_DEPOSIT,
  ROUTE_WALLET_WITHDRAW,
  ROUTE_CHANGE_PASSWORD,
} from './constants/pages';
import { useAuth } from './hooks/use-auth';
import ApiTokens from './pages/ApiTokens';
import LoginForm from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ChangePassword from './pages/ChangePassword';
import CreateInvoice from './pages/CreateInvoice';
import ForgotPassword from './pages/ForgotPassword';
import Merchant from './pages/Merchant';
import InvoiceDetailPage from './pages/MerchantInvoiceDetail';
// import NotFound from './pages/not-found';
import P2P from './pages/P2P';
import P2PCreate from './pages/P2PCreate';
import P2PEdit from './pages/P2PEdit';
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
        <Route path={ROUTE_FORGOT_PASSWORD} component={ForgotPassword} />
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
      <Route
        path={`${ROUTE_WALLET_DEPOSIT}/:iso`}
        component={WalletDepositPage}
      />
      <Route path={ROUTE_WALLET_WITHDRAW} component={WalletWithdrawPage} />
      <Route path={ROUTE_MERCHANT} component={Merchant} />
      <Route path={ROUTE_INVOICE_DETAIL}>
        <InvoiceDetailPage />
      </Route>
      <Route path={ROUTE_INVOICE_CREATE} component={CreateInvoice} />
      <Route path={ROUTE_INVOICE_EDIT} component={CreateInvoice} />
      <Route path={ROUTE_P2P} component={P2P} />
      <Route path={ROUTE_P2P_CREATE} component={P2PCreate} />
      <Route path={ROUTE_P2P_EDIT} component={P2PEdit} />
      <Route path={ROUTE_HISTORY} component={TransactionHistory} />
      <Route path={ROUTE_PROFILE} component={Profile} />
      <Route path={'/api-keys'} component={ApiTokens} />
      <Route path={ROUTE_CHANGE_PASSWORD} component={ChangePassword} />
    </Wouter>
  );
}
