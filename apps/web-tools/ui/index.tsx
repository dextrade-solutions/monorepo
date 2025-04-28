import log from 'loglevel';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { OktoProvider } from '@okto_web3/react-sdk';
import { GoogleOAuthProvider } from '@react-oauth/google';

// eslint-disable-next-line import/order
import { persistor, store } from './store/store';
import { App } from './app';
import { I18nProvider } from './contexts/i18n';

import './css/index.scss';

log.setLevel(log.levels.DEBUG);

const oktoConfig = {
  environment: import.meta.env.VITE_OKTO_ENVIRONMENT || 'sandbox',
  clientPrivateKey: import.meta.env.VITE_OKTO_CLIENT_PRIVATE_KEY,
  clientSWA: import.meta.env.VITE_OKTO_CLIENT_SWA,
};

export function Ui() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <OktoProvider config={oktoConfig}>
              <I18nProvider>
                <App />
              </I18nProvider>
            </OktoProvider>
          </GoogleOAuthProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}
