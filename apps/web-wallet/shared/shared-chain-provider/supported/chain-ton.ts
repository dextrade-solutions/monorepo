import { Address } from '@ton/core';
import SharedChainProvider from '../base';

export default class ChainTon extends SharedChainProvider {
  client: any;

  abi: any = null;

  readonly isEthTypeNetwork = false;

  getAccountLink(address: string) {
    return `${this.config.blockExplorerUrl}/${address}`;
  }

  getBlockExplorerLink(hash: string) {
    return `${this.config.blockExplorerUrl}/transaction/${hash}`;
  }

  generateTokenTransferData(transferParams: any) {
    return '';
    // return generateTRC20TransferData(transferParams);
  }

  parseTokenTransferData(transactionData: string) {
    const transfer = ['address', 'uint256'];
    const [toAddress, amount] = utils.abi.decodeParams(
      transfer,
      transactionData,
    );

    return {
      toAddress,
      tokenAmountWithoutDecimals: amount,
      tokenAmount: amount,
      tokenId: null,
    };
  }

  getStandard(_contract: string) {
    // TODO: implement determine contract standard. Can be TRC10
    return 'trc20';
  }

  isAddress(address: string): boolean {
    try {
      Address.parse(address);
      return true;
    } catch {
      return false;
    }
  }
}
