import { Kyc, PaymentMethods } from 'dex-ui';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { NoMatchPage } from './404';
import DappOpen from './dapp';
import Home from './home';
import InvoicePage from './invoice';
import PairGroups from './pair-groups';
import AppSettings from './settings';
import AppSettingsGeneral from './settings/general';
import { Plans } from './settings/plans';
import SwapProcessing from './swap-processing';
import SwapView from './swap-view';
import SwapWidget from './swap-widget';
import SwapHistory from './trade-history';
import engine from '../../app/engine';
import SigningModal from '../components/app/modals/signing-modal';
import { getSessionSeed } from '../ducks/auth';
import {
  AWAITING_SWAP_ROUTE,
  EXCHANGE_VIEW_ROUTE,
  HOME_ROUTE,
  SWAPS_HISTORY_ROUTE,
  SETTINGS_ROUTE,
  KYC_ROUTE,
  PAYMENT_METHODS_ROUTE,
  SETTINGS_GENERAL_ROUTE,
  PLANS_ROUTE,
  INVOICE_ROUTE,
  DAPP_ROUTE,
  SWAP_WIDGET_ROUTE,
  PAIR_GROUPS_ROUTE,
} from '../helpers/constants/routes';
import { AuthType, useAuthP2P } from '../hooks/useAuthP2P';

export default function RoutesRoot() {
  const { login } = useAuthP2P();
  const dispatch = useDispatch();
  const sessionSeed = useSelector(getSessionSeed);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Automatically scrolls to top whenever pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const { keyringController } = engine;
    keyringController.init({ sessionSeed });
    login({ type: AuthType.keypair });
  }, [dispatch, sessionSeed, navigate]);

  return (
    <>
      <SigningModal />
      <Routes>
        <Route path={HOME_ROUTE} element={<Home />} />
        <Route path={DAPP_ROUTE} element={<DappOpen />} />
        <Route path={EXCHANGE_VIEW_ROUTE} element={<SwapView />} />
        <Route path={SWAP_WIDGET_ROUTE} element={<SwapWidget />} />
        <Route path={PAIR_GROUPS_ROUTE} element={<PairGroups />} />
        <Route
          path={`${AWAITING_SWAP_ROUTE}/:id`}
          element={<SwapProcessing />}
        />
        <Route path={`${INVOICE_ROUTE}/:id`} element={<InvoicePage />} />
        <Route path={SWAPS_HISTORY_ROUTE} element={<SwapHistory />} />
        <Route path={SETTINGS_ROUTE} element={<AppSettings />}>
          <Route path={KYC_ROUTE} element={<Kyc />} />
          <Route path={PAYMENT_METHODS_ROUTE} element={<PaymentMethods />} />
          <Route
            path={SETTINGS_GENERAL_ROUTE}
            element={<AppSettingsGeneral />}
          />
          <Route path={PLANS_ROUTE} element={<Plans />} />
        </Route>
        <Route path="*" element={<NoMatchPage />} />
      </Routes>
    </>
  );
}
