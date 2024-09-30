import { isAddress as isAddressTron, utils } from 'tronweb-fetch/dist/TronWeb';

import { generateTRC20TransferData } from '../../../ui/pages/send/send.utils';
import SharedChainProvider from '../base';

export default class ChainTron extends SharedChainProvider {
  client: any;

  abi: any = null;

  readonly isEthTypeNetwork = false;

  getAccountLink(address: string) {
    return `${this.config.blockExplorerUrl}/#/address/${address}`;
  }

  getBlockExplorerLink(hash: string) {
    return `${this.config.blockExplorerUrl}/#/transaction/${hash}`;
  }

  generateTokenTransferData(transferParams: any) {
    return generateTRC20TransferData(transferParams);
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
    return isAddressTron(address);
  }
}
