import { Kyc } from 'dex-ui';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { NoMatchPage } from './404';
import Home from './home';
import AppSettings from './settings';
import AppSettingsGeneral from './settings/general';
import { Plans } from './settings/plans';
import SwapProcessing from './swap-processing';
import SwapView from './swap-view';
import SwapHistory from './trade-history';
import engine from '../../app/engine';
import SigningModal from '../components/app/modals/signing-modal';
import PaymentMethods from '../components/app/payment-methods';
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
} from '../helpers/constants/routes';

export default function RoutesRoot() {
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
    // if (!isConnected) {
    // clear cache on disconnect
    // dispatch(clearAuthState());
    // queryClient.removeQueries({ queryKey: ['p2pTrades'], exact: true });
    // queryClient.removeQueries({ queryKey: ['p2pTradesActive'], exact: true });
    // queryClient.removeQueries({ queryKey: ['kycInfo'], exact: true });
    // }
  }, [dispatch, sessionSeed, navigate]);

  return (
    <>
      <SigningModal />
      <Routes>
        <Route path={HOME_ROUTE} element={<Home />} />
        <Route path={EXCHANGE_VIEW_ROUTE} element={<SwapView />} />
        <Route
          path={`${AWAITING_SWAP_ROUTE}/:id`}
          element={<SwapProcessing />}
        />
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
