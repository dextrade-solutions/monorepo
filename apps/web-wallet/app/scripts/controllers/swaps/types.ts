import { AssetModel } from '../../../../shared/lib/asset-model';

export const enum EOTCProvider {
  EXOLIX = 'exolix',
  EXZI = 'Exzi',
  MERCURYO = 'mercuryo',
  ALICE_BOB = 'alice-bob',
  CHANGE_NOW = 'change-now',
}

export const enum EDEXProvider {
  UNIZEN = 'unizen',
  ONE_INCH = 'one-inch',
  PANCAKE_SWAP = 'pancake-swap',
  UNISWAP = 'uniswap',
  WOWMAX = 'wowmax',
}

export const enum EProviderExchangerType {
  P2P = 'P2P',
  OTC = 'OTC',
  DEX = 'DEX',
}

export interface INormalizeRates {
  error?: string;
  fromAmount?: string;
  toAmount?: string;
  rate?: string;
  minAmount?: string;
  message?: string;
  hasApproval?: boolean;
  approvedAllowance?: string;
}

export interface ISwapsProvider {
  provider: EOTCProvider | EDEXProvider;
  name: string;
  image: string;
  enabled: boolean;
  index: number;
  providerType: EProviderExchangerType;
}

// export interface IExchangerCoin {
//   chainId: string;
//   account: string;
//   contract?: string;
//   decimals: number;
//   symbol: string;
//   name: string;
//   network: string;
//   standard: string;
// }

// export type IExchangerCoin = ReturnType<typeof useAsset>;
export type IExchangerCoin = AssetModel;

export interface ISwapExchangerParams {
  from: IExchangerCoin;
  to: IExchangerCoin;
  amount: number;
  approvalValue?: number;
}

export interface IGetApprovedAllowanceResult {
  hasApproval: boolean;
  approved: number;
}

export interface IServiceController {
  getRates(params: ISwapExchangerParams, options: unknown): Promise<unknown>;

  swapStart(params: ISwapExchangerParams): Promise<unknown>;

  getById(id: string): Promise<unknown>;

  // approve
  getApprovedAllowance(
    params: ISwapExchangerParams,
  ): Promise<IGetApprovedAllowanceResult>;

  approveAllowance(params: ISwapExchangerParams): Promise<unknown>;

  //
  swap(params: ISwapExchangerParams): Promise<unknown>;
}
