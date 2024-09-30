import { CHAIN_IDS, CHAIN_ID_TO_UUID, TEST_CHAINS } from '../constants/network';
import { Asset } from '../lib/asset-model';
import { NetworkConfiguration } from './types';

export default abstract class SharedChainProvider {
  config: NetworkConfiguration;

  nativeToken: Asset;

  constructor(options: NetworkConfiguration) {
    this.config = { ...options };
    this.nativeToken = {
      localId: options.chainId,
      name: options.ticker,
      symbol: options.ticker,
      decimals: options.decimals || 18,
      uid: CHAIN_ID_TO_UUID[options.chainId],
    };
  }

  get chainId() {
    return this.config.chainId;
  }

  get isNonStandardEthChain() {
    return ![CHAIN_IDS.MAINNET, CHAIN_IDS.GOERLI].some(
      (chainId) => chainId === this.chainId,
    );
  }

  get isTestnet() {
    return TEST_CHAINS.some((chainId: string) => chainId === this.chainId);
  }

  abstract isAddress(address: string): boolean;

  abstract generateTokenTransferData(transferParams: {
    tokenId?: string;
    standard?: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
  }): string | undefined;

  abstract parseTokenTransferData(txData: string): any;

  abstract getStandard(tokenContract: string): string;

  abstract getAccountLink(address: string): string;

  abstract getBlockExplorerLink(address: string): any;
}
