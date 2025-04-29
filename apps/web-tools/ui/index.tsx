import log from 'loglevel';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

// eslint-disable-next-line import/order
import { persistor, store } from './store/store';
import { App } from './app';
import { I18nProvider } from './contexts/i18n';

import './css/index.scss';

log.setLevel(log.levels.DEBUG);

export function Ui() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <I18nProvider>
            <App />
          </I18nProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}
