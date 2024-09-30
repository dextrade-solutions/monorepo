import { networks, address, Network } from 'bitcoinjs-lib';

import SharedChainProvider from '../base';
import { NetworkConfiguration } from '../types';

export default class ChainBitcoin extends SharedChainProvider {
  network: Network;

  readonly isEthTypeNetwork = false;

  constructor(options: NetworkConfiguration) {
    super(options);
    if (this.isTestnet) {
      this.config.blockExplorerUrl = `${this.config.blockExplorerUrl}/bitcoin/testnet`;
    } else {
      this.config.blockExplorerUrl = `${this.config.blockExplorerUrl}/bitcoin`;
    }
    this.network = this.isTestnet ? networks.testnet : networks.bitcoin;
  }

  getAccountLink(account: string) {
    return `${this.config.blockExplorerUrl}/address/${account}`;
  }

  isAddress(string: string): boolean {
    try {
      address.toOutputScript(string, this.network);
      return true;
    } catch (error) {
      return false;
    }
  }

  getStandard() {
    return 'bip44';
  }

  getBlockExplorerLink(hash: string) {
    return `${this.config.blockExplorerUrl}/transaction/${hash}`;
  }
}
