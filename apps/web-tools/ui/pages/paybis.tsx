import {
  PaybisIntegrationPage,
  PaybisFailurePage,
  PaybisDepositRedirectPage,
} from 'dex-ui';
import { Routes, Route } from 'react-router-dom';

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

export default function Paybis() {
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
