import { ObservableStore } from '@metamask/obs-store';
import { WC2Manager } from './WalletConnectV2';
import { DEEPLINKS } from './wc-config';
import { WalletConnectOptions, WalletManagerOptions } from './types';

export default class WalletConnectController {
  store: ObservableStore<any>;

  private walletConnect;

  constructor(initState: any, opts: WalletConnectOptions) {
    this.store = new ObservableStore(initState);

    const storage: WalletManagerOptions['storage'] = {
      getItem: (key: string) => this.store.getState()[key],
      setItem: async (key: string, value: any) =>
        this.store.updateState({ ...this.store.getState(), [key]: value }),
      getKeys: async () => Object.keys(this.store.getState()),
      getEntries: async () => Object.entries(this.store.getState()),
      removeItem: async (key: string) => {
        const state = this.store.getState();
        delete state[key];
        this.store.updateState(state);
      },
    };

    this.walletConnect = this.deferred();

    WC2Manager.init({
      ...opts,
      storage,
    })
      .then((instance) => {
        this.walletConnect.resolve(instance);
      })
      .catch((err) => {
        console.error('Cannot initialize WalletConnect Manager.', err);
      });
  }

  deferred() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  async connect({
    wcUri,
    deeplink,
  }: {
    wcUri: string;
    deeplink: boolean;
  }): Promise<void> {
    const wc = await this.walletConnect.promise;
    // this.walletConnect.removeAll();
    await wc.connect({
      wcUri,
      origin: deeplink ? DEEPLINKS.ORIGIN_DEEPLINK : DEEPLINKS.ORIGIN_QR_CODE,
    });
  }
}
