import { QueryClient } from '@tanstack/react-query';

import DextradeService from './services/dextrade';
import { authdata } from './ui/helpers/authdata';

class Engine {
  // eslint-disable-next-line no-use-before-define
  static #instance: Engine | null;

  queryClient: QueryClient;

  private constructor() {
    this.queryClient = new QueryClient();

    this.initDextradeService();
  }

  private initDextradeService() {
    DextradeService.setOnRequestHandler((config) => {
      const isPublicUrl = config.url?.includes('public/');

      if (!isPublicUrl) {
        config.headers['X-API-KEY'] = authdata().apikey;
      }
      return config;
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
