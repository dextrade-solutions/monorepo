import { dexControllerByProvider, otcControllerByProvider } from './constants';
import SwapsController from './swaps';
import {
  EDEXProvider,
  EOTCProvider,
  IGetApprovedAllowanceResult,
  IServiceController,
  ISwapExchangerParams,
  ISwapsProvider,
} from './types';

export default class SwapsExchanger {
  private readonly otcControllers: Map<EOTCProvider, IServiceController>;

  private readonly dexControllers: Map<EDEXProvider, IServiceController>;

  constructor(private readonly swaps: SwapsController) {
    const { swapOTCProviders, swapDEXProviders } = this.state;
    this.otcControllers = this.generateControllers<EOTCProvider>(
      swapOTCProviders,
      otcControllerByProvider,
    );
    this.dexControllers = this.generateControllers<EDEXProvider>(
      swapDEXProviders,
      dexControllerByProvider,
    );
  }

  private get state() {
    return this.swaps.store.getState().swapsState;
  }

  private update(next = {}) {
    // this.swaps.updater({
    //   ...this.state,
    //   ...next,
    // });
    this.swaps.store.updateState({
      swapsState: {
        ...this.state,
        ...next,
      },
    });
  }

  private generateControllers<T extends EOTCProvider | EDEXProvider>(
    providerState: Record<T, ISwapsProvider>,
    providersControllers: Record<T, IServiceController>,
  ): Map<T, IServiceController> {
    return Object.entries(providerState).reduce((acc, [key, value]) => {
      const provider = value as ISwapsProvider;
      const ServiceController = providersControllers[key as T];
      if (!ServiceController || !provider?.enabled) {
        return acc;
      }
      acc.set(key as T, new ServiceController(this.swaps));
      return acc;
    }, new Map() as Map<T, IServiceController>);
  }

  private getProviderController(provider: EOTCProvider | EDEXProvider) {
    const controllers: Map<EOTCProvider | EDEXProvider, IServiceController> =
      new Map([...this.otcControllers].concat([...this.dexControllers]));
    const controller = controllers.get(provider);
    if (!controller) {
      throw new Error(
        `Not found controller for [${provider.toUpperCase()}] provider`,
      );
    }
    return controller;
  }

  /**
   * @param params
   * @deprecated*
   */
  public async getOtcRates(
    params: unknown,
  ): Promise<Record<EOTCProvider, ISwapsProvider>> {
    const result = {} as Record<EOTCProvider, ISwapsProvider>;
    for (const [provider, controller] of [...this.otcControllers]) {
      result[provider] = await controller.getRates(params);
    }
    return result;
  }

  /**
   * @param params
   * @param findProvider
   * @deprecated*
   */
  public async getDexRates(params: unknown, findProvider?: EDEXProvider) {
    const result = {} as Record<EDEXProvider, ISwapsProvider>;
    const controllers = [...this.dexControllers].filter(([p]) => {
      if (!findProvider) {
        return Boolean(p);
      }
      return findProvider === p;
    });
    for (const [provider, controller] of controllers) {
      result[provider] = await controller.getRates(params, {
        checkApproval: Boolean(findProvider),
      });
    }
    return result;
  }

  /**
   * @param params
   * @param provider
   */
  public async swapExchangerGetAllowance<P extends ISwapExchangerParams>(
    params: P,
    provider: EOTCProvider | EDEXProvider,
  ): Promise<IGetApprovedAllowanceResult> {
    return await this.getProviderController(provider).getApprovedAllowance(
      params,
    );
  }

  /**
   * @param params
   * @param provider
   */
  public async swapExchangerApprove<P extends ISwapExchangerParams>(
    params: P,
    provider: EOTCProvider | EDEXProvider,
  ): Promise<unknown> {
    return await this.getProviderController(provider).approveAllowance(params);
  }

  /**
   * @param params
   * @param provider
   */
  public async swapExchangerByProvider<P extends ISwapExchangerParams>(
    params: P,
    provider: EOTCProvider | EDEXProvider,
  ): Promise<unknown> {
    return await this.getProviderController(provider).swap(params);
  }

  /**
   * @param params
   * @param provider
   * @deprecated The method should not be used
   * create structure for get approve row tx params
   * and get swap row tx params
   */
  public async swapOtcExchangesStart(
    params: unknown,
    provider: EOTCProvider,
  ): Promise<unknown> {
    const data = await this.getProviderController(provider).swapStart(params);
    const exchange = { id: data?.id || '' };
    this.swaps.updater({
      otcCurrentExchange: exchange,
      p2pCurrentExchange: exchange,
    });
    return data;
  }

  public async swapOtcExchangesGetById(
    id: string,
    provider: EOTCProvider,
  ): Promise<unknown> {
    return await this.getProviderController(provider).getById(id);
  }
}
