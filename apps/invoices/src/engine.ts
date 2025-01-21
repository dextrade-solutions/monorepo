class Engine {
  // eslint-disable-next-line no-use-before-define
  static #instance: Engine | null;

  public static get instance(): Engine {
    if (!Engine.#instance) {
      Engine.#instance = new Engine();
    }

    return Engine.#instance;
  }
}

export default Engine.instance;
