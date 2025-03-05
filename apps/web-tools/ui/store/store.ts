import { configureStore as baseConfigureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';

import enLocales from '../../public/locales/en/messages.json';
import rootReducer from '../ducks';
import { fetchLocale } from '../helpers/utils/i18n-helper';

type RootReducerReturnType = ReturnType<typeof rootReducer>;

function configureStore(preloadedState: any) {
  const isDev = true;
  // const enhancers: StoreEnhancer[] = [];

  // if (isDev) {
  //   enhancers.push(
  //     devtoolsEnhancer({
  //       name: 'MetaMask',
  //       hostname: 'localhost',
  //       port: 8000,
  //       realtime: true,
  //     }) as StoreEnhancer,
  //   );
  // }

  return baseConfigureStore({
    reducer: rootReducer as () => RootReducerReturnType,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        /**
         * We do not persist the redux tree for rehydration, so checking for
         * serializable state keys is not relevant for now. Any state that persists
         * is managed in the background. We may at some point want this, but we can
         * gradually implement by using the ignore options to ignore those actions
         * and state keys that are not serializable, preventing us from adding new
         * actions and state that would violate our ability to persist state keys.
         * NOTE: redux-thunk is included by default in the middleware below.
         */
        serializableCheck: false,
        /**
         * immutableCheck controls whether we get warnings about mutation of
         * state, which will be true in dev. However in test lavamoat complains
         * about something the middleware is doing. It would be good to figure
         * that out and enable this in test environments so that mutation
         * causes E2E failures.
         */
        immutableCheck: isDev
          ? {
              warnAfter: 100,
            }
          : false,
      }),
    devTools: false,
    preloadedState,
  });
}
export type Store = ReturnType<typeof configureStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<Store['getState']>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = Store['dispatch'];

let initialLocale: string;
try {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam) {
    initialLocale = langParam;
  } else {
    const persistedState = localStorage.getItem('persist:localeMessages');
    if (persistedState) {
      const parsedState = JSON.parse(persistedState);
      initialLocale = parsedState?.currentLocale
        ? parsedState.currentLocale.replace(/"/g, '')
        : 'en';
    } else {
      initialLocale = 'en';
    }
  }
} catch (error) {
  console.error('Error reading persisted state or url params:', error);
  initialLocale = 'en';
}

const initialMessages = await fetchLocale(initialLocale);

export const store = configureStore({
  localeMessages: {
    currentLocale: initialLocale,
    current: initialMessages,
  },
});

export const persistor = persistStore(store);
