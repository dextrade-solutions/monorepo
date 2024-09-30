import Eth from 'ethjs';
import { getAccountLink, getBlockExplorerLink } from '@metamask/etherscan-link';

import { addHexPrefix } from 'ethereumjs-util';
import { parseStandardTokenTransactionData } from '../../modules/transaction.utils';
import { getTokenIdParam } from '../../lib/token-util';
import { getTokenValueParam } from '../../lib/metamask-controller-utils';
import { calcTokenAmount } from '../../lib/transactions-controller-utils';

import { getTokenAddressParam } from '../../../ui/helpers/utils/token-util';

import {
  isBurnAddress,
  isValidHexAddress,
} from '../../modules/hexstring-utils';
import {
  generateERC20TransferData,
  generateERC721TransferData,
} from '../../../ui/pages/send/send.utils';
import SharedChainProvider from '../base';
import { TokenStandard } from '../../constants/transaction';
import { NetworkConfiguration } from '../types';
import { estimateGasLimitForSend } from '../../../ui/ducks/send/helpers';
import {
  AtomicSwapParams,
  generateAtomicSwapTransferData,
} from '../../lib/atomic-swaps';

export default class ChainEth extends SharedChainProvider {
  client: typeof Eth;

  readonly isEthTypeNetwork = true;

  readonly eip1559support = true;

  constructor(options: NetworkConfiguration) {
    super(options);
    const { rpcUrl } = options;
    if (!rpcUrl) {
      throw new Error('rpcUrl must be provided for eth type network');
    }
    this.client = new Eth(new Eth.HttpProvider(rpcUrl));
  }

  getAccountLink(address: string) {
    return getAccountLink(address, this.chainId, {
      blockExplorerUrl: this.config.blockExplorerUrl,
    });
  }

  getBlockExplorerLink(hash: string) {
    return getBlockExplorerLink(
      {
        chainId: this.chainId,
        hash: addHexPrefix(hash),
        metamaskNetworkId: '',
      },
      {
        blockExplorerUrl: this.config.blockExplorerUrl,
      },
    );
  }

  /**
   * Check string is valid address
   *
   * @param address - account address
   */
  isAddress(address: string): boolean {
    const isAddress =
      !isBurnAddress(address) &&
      isValidHexAddress(address, {
        mixedCaseUseChecksum: true,
      });
    return isAddress;
  }

  generateAtomicSwapTransferData(params: AtomicSwapParams) {
    return generateAtomicSwapTransferData(params);
  }

  generateTokenTransferData(params: {
    tokenId?: string; // NFT
    standard?: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
  }): string | undefined {
    const standard = params.standard || TokenStandard.ERC20;
    switch (standard) {
      case TokenStandard.ERC721:
        return generateERC721TransferData({
          fromAddress: params.fromAddress,
          toAddress: params.toAddress,
          tokenId: params.tokenId,
        });
      case TokenStandard.ERC20:
      default:
        return generateERC20TransferData({
          toAddress: params.toAddress,
          amount: params.amount,
        });
    }
  }

  parseTokenTransferData(transactionData: string) {
    const tokenData = parseStandardTokenTransactionData(transactionData);
    if (!tokenData) {
      throw new Error('Unable to detect valid token data');
    }
    if (tokenData.name === 'multicall') {
      const nestedData = parseStandardTokenTransactionData(
        tokenData.args?.data[0],
      );
      if (!nestedData) {
        throw new Error('Unable to detect valid multicall data');
      }
      return {
        toAddress: nestedData.args.params.recipient,
        tokenAmount: nestedData.args.params.amountIn,
        tokenId: nestedData.args.params.tokenIn,

        // extra params
        deadline: tokenData.args.deadline.toNumber() * 1000,
        tokenAmountOut: nestedData.args.params.amountOutMinimum,
        tokenOut: nestedData.args.params.tokenOut,
      };
    }
    // Sometimes the tokenId value is parsed as "_value" param. Not seeing this often any more, but still occasionally:
    // i.e. call approve() on BAYC contract - https://etherscan.io/token/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d#writeContract, and tokenId shows up as _value,
    // not sure why since it doesn't match the ERC721 ABI spec we use to parse these transactions - https://github.com/MetaMask/metamask-eth-abis/blob/d0474308a288f9252597b7c93a3a8deaad19e1b2/src/abis/abiERC721.ts#L62.
    const tokenId = getTokenIdParam(tokenData)?.toString();

    const toAddress = getTokenAddressParam(tokenData);
    const tokenAmount =
      tokenData &&
      calcTokenAmount(
        getTokenValueParam(tokenData),
        this.config.decimals,
      ).toString(10);
    return {
      toAddress,
      tokenAmount,
      tokenId,
    };
  }

  estimateFee(params) {
    const gasLimit = estimateGasLimitForSend(params);
  }

  getStandard(): string {
    // no implemented
    return '';
  }
}
