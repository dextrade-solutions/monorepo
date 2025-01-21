import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import appReducer from './app/app';
import authReducer from './auth';
import localeMessagesReducer from './locale/locale';
import swapsReducer from './swaps/swaps';

export default combineReducers({
  auth: persistReducer(
    {
      key: 'auth',
      storage,
      blacklist: ['authStatus'],
    },
    authReducer,
  ),
  app: persistReducer(
    {
      key: 'app',
      storage,
    },
    appReducer,
  ),
  swaps: swapsReducer,
  localeMessages: persistReducer(
    { key: 'localeMessages', storage, blacklist: ['current'] },
    localeMessagesReducer,
  ),
});
