import ExolixController from './exolix/exolix.controller';
import OneInchController from './oneInch/oneInch.controller';
import UniswapController from './uniswap/uniswap.controller';
import PancakeswapController from './pancakeswap/pancakeswap.controller';
import {
  EDEXProvider,
  EOTCProvider,
  EProviderExchangerType,
  IServiceController,
  ISwapsProvider,
} from './types';
import UnizenController from './unizen/unizen.controller';

const defaultOTCSwapProvider: Omit<ISwapsProvider, 'provider'> = {
  name: '',
  image: '',
  enabled: false,
  index: 0,
  providerType: EProviderExchangerType.OTC,
};

export const swapOTCProviders: Record<EOTCProvider, ISwapsProvider> = {
  [EOTCProvider.EXOLIX]: {
    ...defaultOTCSwapProvider,
    provider: EOTCProvider.EXOLIX,
    name: 'Exolix',
    image: 'exolix',
    enabled: true,
    index: 1,
  },
  [EOTCProvider.EXZI]: {
    ...defaultOTCSwapProvider,
    provider: EOTCProvider.EXZI,
    name: 'Exzi',
    image: 'mercuryo',
  },
  [EOTCProvider.MERCURYO]: {
    ...defaultOTCSwapProvider,
    provider: EOTCProvider.MERCURYO,
    name: 'Mercuryo',
    image: 'mercuryo',
  },
  [EOTCProvider.ALICE_BOB]: {
    ...defaultOTCSwapProvider,
    provider: EOTCProvider.ALICE_BOB,
    name: 'Alice-bob',
    image: 'aliceBob',
  },
  [EOTCProvider.CHANGE_NOW]: {
    ...defaultOTCSwapProvider,
    provider: EOTCProvider.CHANGE_NOW,
    name: 'Change NOW',
    image: 'changeNow',
  },
};

const defaultDEXSwapProvider = {
  ...defaultOTCSwapProvider,
  providerType: EProviderExchangerType.DEX,
};

export const swapDEXProviders = {
  [EDEXProvider.ONE_INCH]: {
    ...defaultDEXSwapProvider,
    provider: EDEXProvider.ONE_INCH,
    name: '1Inch',
    image: 'oneinch.svg',
    enabled: true,
    index: 0,
  },
  [EDEXProvider.PANCAKE_SWAP]: {
    ...defaultDEXSwapProvider,
    provider: EDEXProvider.PANCAKE_SWAP,
    name: 'Pancake Swap',
    image: 'pancakeSwap.svg',
    enabled: true,
    index: 2,
  },
  [EDEXProvider.UNISWAP]: {
    ...defaultDEXSwapProvider,
    provider: EDEXProvider.UNISWAP,
    name: 'Uniswap',
    image: 'uniswap.svg',
    enabled: true,
    index: 3,
  },
  [EDEXProvider.UNIZEN]: {
    ...defaultDEXSwapProvider,
    provider: EDEXProvider.UNIZEN,
    name: 'Unizen',
    image: 'unizen.png',
    enabled: true,
    index: 1,
  },
  [EDEXProvider.WOWMAX]: {
    ...defaultDEXSwapProvider,
    provider: EDEXProvider.WOWMAX,
    name: 'Wowmax',
    image: 'wowmax.svg',
    enabled: false,
    index: -1,
  },
};

export const otcControllerByProvider: Record<EOTCProvider, IServiceController> =
  {
    [EOTCProvider.EXZI]: ExolixController,
    [EOTCProvider.EXOLIX]: ExolixController,
    [EOTCProvider.MERCURYO]: ExolixController,
    [EOTCProvider.ALICE_BOB]: ExolixController,
    [EOTCProvider.CHANGE_NOW]: ExolixController,
  };

export const dexControllerByProvider: Record<EDEXProvider, IServiceController> =
  {
    [EDEXProvider.ONE_INCH]: OneInchController,
    [EDEXProvider.UNIZEN]: UnizenController,
    [EDEXProvider.UNISWAP]: UniswapController,
    [EDEXProvider.PANCAKE_SWAP]: PancakeswapController,
    [EDEXProvider.WOWMAX]: UniswapController,
  };
