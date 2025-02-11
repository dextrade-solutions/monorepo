import { combineReducers } from 'redux';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import appReducer from './app/app';
import authReducer from './auth';
import localeMessagesReducer from './locale/locale';
import { migrations } from './migrations';
import swapsReducer from './swaps/swaps';
import { compareVersions } from '../../app/helpers/utils';

const PERSIST_VERSION = __VERSION__;

// Create a transform to handle versioning
const migrate = (inboundState: any) => {
  const persistedVersion = inboundState?._persist?.version || '0.0.0';

  if (compareVersions(persistedVersion, PERSIST_VERSION) === 0) {
    return inboundState; // No migration needed
  }
  let migratedState = { ...inboundState };

  // Iterate through all available migrations and apply them if needed
  Object.entries(migrations).forEach(([migrationVersion, migrationFn]) => {
    if (compareVersions(persistedVersion, migrationVersion) < 0) {
      console.info(`Applying migration ${migrationVersion}`);

      migratedState = migrationFn({ ...migratedState }); // Apply the migration
    }
  });
  return migratedState;
};

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
      // transforms: [versionTransform], // Add the version transform
      version: PERSIST_VERSION,
      migrate: (state) => Promise.resolve(migrate(state)),
    },
    appReducer,
  ),
  swaps: swapsReducer,
  localeMessages: persistReducer(
    { key: 'localeMessages', storage, blacklist: ['current'] },
    localeMessagesReducer,
  ),
});
