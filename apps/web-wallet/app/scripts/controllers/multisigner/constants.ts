import { CHAIN_IDS } from '../../../../shared/constants/network';
import { ProviderConfig } from '../chains-controller/types';
import {
  MultisignerController,
  MultisignerBTCController,
  MultisignerBNBController,
} from './controllers';
import { MultisignerETHController } from './controllers/ethereum/MultisignerETHController';
import {
  ICurrentMultisignerSate,
  IMultisign,
  IMultisignerAddressedState,
  IMultisignerChainState,
  IMultisignerStore, IMultisigTransaction,
} from './types';

export type TProviderChainList = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS][];

export enum EProviderChains {
  BINANCE = 'BINANCE',
  BITCOIN = 'BITCOIN',
  ETHEREUM = 'ETHEREUM',
  TRON = 'TRON',
}

export const BINANCE_CHAINS: TProviderChainList = [
  CHAIN_IDS.BSC,
  CHAIN_IDS.BSC_TESTNET,
];
export const BITCOIN_CHAINS: TProviderChainList = [
  CHAIN_IDS.BTC,
  CHAIN_IDS.BTC_TESTNET,
];
export const ETHEREUM_CHAINS: TProviderChainList = [
  CHAIN_IDS.MAINNET,
  CHAIN_IDS.GOERLI,
  CHAIN_IDS.SEPOLIA,
];
export const TRON_CHAINS: TProviderChainList = [
  CHAIN_IDS.TRON,
  CHAIN_IDS.TRON_TESTNET,
];

export const CHAINS_PROVIDER: Record<EProviderChains, TProviderChainList> = {
  [EProviderChains.BINANCE]: BINANCE_CHAINS,
  [EProviderChains.BITCOIN]: BITCOIN_CHAINS,
  [EProviderChains.ETHEREUM]: ETHEREUM_CHAINS,
  [EProviderChains.TRON]: TRON_CHAINS,
};

export const providerControllerMap: Map<
  EProviderChains,
  MultisignerController
> = new Map([
  [EProviderChains.BITCOIN, MultisignerBTCController],
  [EProviderChains.BINANCE, MultisignerBNBController],
  [EProviderChains.ETHEREUM, MultisignerETHController],
]);

export const defaultControllerData: IMultisignerChainState = {
  multisigs: new Map<IMultisign['id'], IMultisign>(),
  transactions: new Map<IMultisigTransaction['id'], IMultisigTransaction>(),
};

export const defaultCreatorData = {
  tokens: [],
  token: null,
  provider: { chainId: '', contract: '' } as unknown as ProviderConfig,
  totalSigners: null,
  minForBroadcasting: null,
  disabledGenerate: true,
};

export const defaultAddressState: IMultisignerAddressedState = {
  creator: defaultCreatorData,
  isLoading: false,
  state: {},
};
