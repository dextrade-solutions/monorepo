import { Routes, Route, Outlet } from 'react-router-dom';

import PaybisDepositRedirectPage from '../components/app/paybis/paybis-depositredirect';
import PaybisFailurePage from '../components/app/paybis/paybis-failure';
import PaybisIntegrationPage from '../components/app/paybis/PaybisIntegrationPage';
import { PAYBIS_ROUTE } from '../helpers/constants/routes';
import { Box } from '@mui/material';

interface PaybisConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  widgetUrl: string;
  widgetUrlSell: string;
  isLive: boolean;
  apiUrl: string;
  backUrl: string;
  failureBackUrl: string;
  depositRedirectUrl: string;
  user_id: string;
  email: string;
  locale: string;
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

const isProduction = false && import.meta.env.MODE === 'production';

export default function Paybis() {
  const paybisConfig: PaybisConfig = {
    apiKey: isProduction
      ? getEnvVar('VITE_PAYBIS_API_KEY_PROD', 'not_configured')
      : getEnvVar('VITE_PAYBIS_API_KEY_SANDBOX', 'not_configured'),
    secretKey: 'not_configured',
    baseUrl: isProduction
      ? getEnvVar('VITE_PAYBIS_API_URL_PROD', 'not_configured')
      : getEnvVar('VITE_PAYBIS_API_URL_SANDBOX', 'not_configured'),
    widgetUrl: isProduction
      ? getEnvVar('VITE_PAYBIS_WIDGET_URL_PROD', 'not_configured')
      : getEnvVar('VITE_PAYBIS_WIDGET_URL_SANDBOX', 'not_configured'),
    widgetUrlSell: isProduction
      ? getEnvVar('VITE_PAYBIS_WIDGETSELL_URL_PROD', 'not_configured')
      : getEnvVar('VITE_PAYBIS_WIDGETSELL_URL_SANDBOX', 'not_configured'),
    isLive: isProduction,
    apiUrl: getEnvVar('VITE_API_BASE_URL'),
    backUrl: `${window.location.protocol}//${window.location.host}/paybis`,
    failureBackUrl: `${window.location.protocol}//${window.location.host}/paybis/failure`,
    depositRedirectUrl: `${window.location.protocol}//${window.location.host}/paybis/deposit`,
    user_id: '2',
    email: 'sshevaiv++@gmail.com',
    locale: 'en',
  };

  return (
    <>
      <Routes>
        <Route
          path="failure/:requestId"
          element={<PaybisFailurePage paybisConfig={paybisConfig} />}
        />
        <Route
          path="deposit/:requestId"
          element={<PaybisDepositRedirectPage paybisConfig={paybisConfig} />}
        />

        <Route
          path="*"
          element={<PaybisIntegrationPage paybisConfig={paybisConfig} />}
        />
      </Routes>
    </>
  );
}
