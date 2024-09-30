import OneSignal from 'react-onesignal';
import React from 'react';
import { Store } from 'redux';
import ReactDOM from 'react-dom';

import './setup-globals';
import '../app/scripts/sentry-install';

import configureStore from '../ui/store/store';
import { setupLocale } from '../shared/lib/error-utils';
import { setupTokens } from '../shared/lib/token-util';
import { openDexDB, DEX_STORE } from '../shared/lib/dex-db';

import backgroundConnection from '../app/scripts/background-pwa';
import { updateMetamaskState } from '../ui/store/actions';
import Root from '../ui/pages';

import '../ui/css/index.scss';
import '@fortawesome/fontawesome-free/scss/fontawesome.scss';
import '@fortawesome/fontawesome-free/scss/brands.scss';
import '@fortawesome/fontawesome-free/scss/regular.scss';
import '@fortawesome/fontawesome-free/scss/solid.scss';
import '@fortawesome/fontawesome-free/scss/v4-shims.scss';

let reduxStore: Store;

async function startUI(metamaskState: any) {
  if (
    process.env.NODE_ENV !== 'development' &&
    OneSignal.Notifications.isPushSupported()
  ) {
    try {
      OneSignal.init({
        appId: '32208964-1475-4ece-8762-b8239b942113',
      })
        .then(() => {
          const { mnemonicHash } = metamaskState;
          if (mnemonicHash) {
            return OneSignal.login(mnemonicHash);
          }
          return null;
        })
        .then(() => {
          OneSignal.Slidedown.promptPush();
        });
    } catch (e) {
      console.log('One Signal init error', e);
    }
  }
  const defaultState = metamaskState;

  const [{ currentLocaleMessages, enLocaleMessages }, tokensRegistry] =
    await Promise.all([setupLocale(defaultState.currentLocale), setupTokens()]);

  // TODO: Fix RTL switchDirection
  // if (metamaskState.textDirection === 'rtl') {
  //   await switchDirection('rtl');
  // }

  const draftInitialState = {
    activeTab: {
      origin: 'METAMASK',
    },

    metamask: Object.assign(defaultState, { tokensRegistry }),

    // appState represents the current tab's popup state
    appState: {},

    localeMessages: {
      currentLocale: defaultState.currentLocale,
      current: currentLocaleMessages,
      en: enLocaleMessages,
    },
  };

  const store = configureStore(draftInitialState);
  reduxStore = store;

  ReactDOM.render(<Root store={store} />, document.getElementById('root'));

  return store;
}

backgroundConnection.onInitialized = async (controller) => {
  const dexDb = await openDexDB();
  const handleUpdate = (metamaskState: any, storageState: any) => {
    if (reduxStore) {
      reduxStore.dispatch(updateMetamaskState(metamaskState));
    }
    dexDb.put(DEX_STORE, storageState, 'data');
  };
  controller.setupControllerConnectionSpa(handleUpdate);
  startUI(controller.getState());
};
