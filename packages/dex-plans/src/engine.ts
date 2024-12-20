import { QueryClient } from '@tanstack/react-query';

class Engine {
  // eslint-disable-next-line no-use-before-define
  static #instance: Engine | null;

  queryClient: QueryClient;

  private constructor() {
    this.queryClient = new QueryClient();
  }

  public static get instance(): Engine {
    if (!Engine.#instance) {
      Engine.#instance = new Engine();
    }

    return Engine.#instance;
  }
}

export default Engine.instance;
