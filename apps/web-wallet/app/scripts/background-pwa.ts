import { openDexDB, DEX_STORE } from '../../shared/lib/dex-db';
import { maskObject } from '../../shared/modules/object.utils';
import Migrator from './lib/migrator';
import migrations from './migrations';
import rawFirstTimeState from './first-time-state';
import { SENTRY_STATE } from './lib/setupSentry';

import MetamaskController from './metamask-controller';

function setupSentryGetStateGlobal(store: MetamaskController) {
  global.stateHooks.getSentryState = function () {
    const fullState = store.getState();
    const debugState = maskObject({ metamask: fullState }, SENTRY_STATE);
    return {
      browser: window.navigator.userAgent,
      store: debugState,
      version: global.platform.getVersion(),
    };
  };
}

const firstTimeState = { ...rawFirstTimeState };

class PwaBackgroundConnection {
  onInitialized: ((background: MetamaskController) => void) | null = null;

  backgroundController: MetamaskController | null = null;

  constructor() {
    this.initialize();
  }

  get controller() {
    if (!this.backgroundController) {
      throw new Error('No metamask controller initalized');
    }
    return this.backgroundController;
  }

  async initialize() {
    const dexDb = await openDexDB();
    const migrator = new Migrator({ migrations });

    let versionedData;
    try {
      const [data, meta] = await Promise.all([
        dexDb.get(DEX_STORE, 'data'),
        dexDb.get(DEX_STORE, 'meta'),
      ]);
      if (!meta) {
        throw new Error('App version not found');
      }
      versionedData = {
        data,
        meta,
      };
    } catch {
      migrator.on('error', console.warn);
      versionedData = migrator.generateInitialState(firstTimeState);
    }

    // check if somehow state is empty
    // this should never happen but new error reporting suggests that it has
    // for a small number of users
    // https://github.com/metamask/metamask-extension/issues/3919
    if (versionedData && !versionedData.data) {
      // unable to recover, clear state
      versionedData = migrator.generateInitialState(firstTimeState);
    }

    // migrate data
    versionedData = await migrator.migrateData(versionedData);
    if (!versionedData) {
      throw new Error('MetaMask - migrator returned undefined');
    }
    await Promise.all([
      dexDb.put(DEX_STORE, versionedData.data, 'data'),
      dexDb.put(DEX_STORE, versionedData.meta, 'meta'),
    ]);
    const background = new MetamaskController({
      infuraProjectId: process.env.INFURA_PROJECT_ID,
      platform: global.platform,
      // User confirmation callbacks:
      // showUserConfirmation
      // openPopup,
      initState: versionedData.data,
      initLangCode: 'en',
      // notificationManager,
      // browser,
      // getRequestAccountTabIds: () => {
      //   return requestAccountTabIds;
      // },
      // getOpenMetamaskTabsIds: () => {
      //   return openMetamaskTabsIDs;
      // },
      // localStore: localStorage,
    });
    this.backgroundController = background;
    setupSentryGetStateGlobal(background);
    if (this.onInitialized) {
      this.onInitialized(background);
    }
  }
}

const connection = new PwaBackgroundConnection();

export default connection;
