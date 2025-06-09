import {
  PaybisIntegrationPage,
  PaybisFailurePage,
  PaybisDepositRedirectPage,
} from 'dex-ui';
import { Routes, Route } from 'react-router-dom';

export default function Paybis() {
  return (
    <>
      <Routes>
        <Route path="failure/:requestId" element={<PaybisFailurePage />} />
        <Route
          path="deposit/:requestId"
          element={<PaybisDepositRedirectPage />}
        />

        <Route path="*" element={<PaybisIntegrationPage />} />
      </Routes>
    </>
  );
}
