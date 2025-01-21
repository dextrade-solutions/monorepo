import { ServiceBridge } from 'dex-services';

import KeyringController from './controllers/keyring';
import SwapsController from './controllers/swaps';
import { DEXTRADE_BASE_URL } from './helpers/constants';
import P2PService from './services/p2p-service';
import { store } from '../ui/store/store';

class Engine {
  // eslint-disable-next-line no-use-before-define
  static #instance: Engine | null;

  keyringController: KeyringController;

  swapsController: SwapsController;

  private constructor() {
    this.keyringController = new KeyringController();
    this.swapsController = new SwapsController();

    this.initP2PService();
  }

  private initP2PService() {
    P2PService.setOnRequestHandler((config) => {
      const { auth } = store.getState();
      const isPublicUrl = config.url?.includes('public/');

      if (auth?.authData?.apikey && !isPublicUrl) {
        config.headers['X-API-KEY'] = auth.authData.apikey;
        if (['post', 'put', 'delete'].includes(config.method || '')) {
          const body = {
            ...(config.data || {}),
            timestamp: new Date().getTime(),
          };
          config.headers.signature = this.keyringController.signDER(
            JSON.stringify(body),
          );
          config.data = body;
        }
      }
      return config;
    });
    ServiceBridge.instance.init({
      baseUrl: DEXTRADE_BASE_URL,
      customFetch: (fetchUrl, config) => {
        const urlInstance = new URL(fetchUrl);
        const url = `${DEXTRADE_BASE_URL}${urlInstance.pathname}${urlInstance.search}`;
        const { auth } = store.getState();
        const isPublicUrl = String(url).includes('public/');
        if (auth.authData.apikey && !isPublicUrl) {
          config.headers['X-API-KEY'] = auth.authData.apikey;
          if (['post', 'put', 'delete'].includes(config.method || '')) {
            const body = {
              ...config.body,
              timestamp: new Date().getTime(),
            };
            config.headers.signature = this.keyringController.signDER(
              JSON.stringify(body),
            );
            config.body = body;
          }
        }
        return fetch(url, config);
      },
    });
  }

  public static get instance(): Engine {
    if (!Engine.#instance) {
      Engine.#instance = new Engine();
    }

    return Engine.#instance;
  }
}

export default Engine.instance;
