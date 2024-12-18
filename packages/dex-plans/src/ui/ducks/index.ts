import { modalsReducer } from 'dex-ui';
import { combineReducers } from 'redux';

import appReducer from './app/app';

export default combineReducers({
  app: appReducer,
  modals: modalsReducer,
});
