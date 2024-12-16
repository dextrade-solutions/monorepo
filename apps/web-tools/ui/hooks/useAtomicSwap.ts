import { remove0x } from '@metamask/utils';
import { BUILT_IN_NETWORKS } from 'dex-helpers';
import { AssetModel, Trade } from 'dex-helpers/types';
import { atomicService } from 'dex-services';
import { parseEther, parseUnits } from 'viem';
import { useReadContract, useWalletClient, useWriteContract } from 'wagmi';

import useAsset from './asset/useAsset';
import { ATOMIC_SWAP_ABI } from '../../app/constants/abi';
import { SECOND } from '../../app/constants/time';
import {
  NULLISH_TOKEN_ADDRESS,
  buildAtomicSwap,
  getTradeKeyPair,
} from '../../app/helpers/atomic-swaps';
import { unlockSafe } from '../../app/helpers/bitcoin/unlock-safe';
import { isBtcTypeAsset } from '../../app/helpers/chain-helpers/is-btc-type-asset';

const getParsedExchangerParams = (trade: Trade) => {
  if (trade.exchangerParams) {
    const params = trade.exchangerParams.split('|');
    return {
      initiatorRefundTime: params[0],
      responderRefundTime: params[1],
      redeemPKH: params[2],
      refundPKH: params[3],
      redeemPkId: params[4],
      refundPkId: params[5],
      responderAmount: BigInt(parseEther(params[6])),
    };
  }
  return null;
};

//     swapResponse.id,
// ${swapResponse. initiatorRefundTime}",
// ${swapResponse. responderRefundTime*",
//   redeemPkh,
//   refundPhk,
// swapResponse.responderRedeemPKId,
// swapResponse.responderRefundPKId,
// swapResponse.responderAmount,

export const useAtomicSwap = (
  exchange: Trade,
  from: AssetModel,
  to: AssetModel,
) => {
  const { data: walletClient } = useWalletClient();
  const { connector } = useAsset(from);
  const { isAtomicSwap } = exchange.exchangerSettings;
  const fromAtomicSwapContract =
    isAtomicSwap && BUILT_IN_NETWORKS[from.network]?.atomicSwapContract;
  const toAtomicSwapContract =
    isAtomicSwap && BUILT_IN_NETWORKS[to.network]?.atomicSwapContract;

  const expirationFrom =
    isAtomicSwap &&
    BigInt(BUILT_IN_NETWORKS[from.network]?.atomicSwapExpiration) * 2n;
  const expirationTo =
    isAtomicSwap && BigInt(BUILT_IN_NETWORKS[to.network]?.atomicSwapExpiration);

  const toSpendAmount = BigInt(parseEther(exchange.amount1.toFixed(8)));
  const exchangerParams = getParsedExchangerParams(exchange);
  const toReceiveAmount =
    exchangerParams?.responderAmount ||
    BigInt(parseEther(exchange.amount2.toFixed(8)));
  const { hashLock: hashedPassword, password } = getTradeKeyPair(exchange.id);

  const fromAtomicSwap =
    fromAtomicSwapContract &&
    expirationFrom &&
    hashedPassword &&
    walletClient &&
    buildAtomicSwap(
      from,
      walletClient.account.address,
      exchange.exchangerSettings.walletAddress,
      hashedPassword,
      expirationFrom,
      toSpendAmount,
    );
  const toAtomicSwap =
    toAtomicSwapContract &&
    expirationTo &&
    hashedPassword &&
    buildAtomicSwap(
      to,
      exchange.exchangerSettings.walletAddressInNetwork2,
      exchange.clientWalletAddress,
      hashedPassword,
      expirationTo,
      toReceiveAmount,
    );
  const { writeContract } = useWriteContract();

  const safe1 = useReadContract({
    abi: ATOMIC_SWAP_ABI,
    chainId: from.chainId,
    address: fromAtomicSwapContract,
    functionName: 'swaps',
    args: [fromAtomicSwap?.swapId],
  });
  const safe2 = useReadContract({
    abi: ATOMIC_SWAP_ABI,
    chainId: to.chainId,
    address: toAtomicSwapContract,
    functionName: 'swaps',
    args: [toAtomicSwap?.swapId],
    query: {
      refetchInterval: 4 * SECOND,
    },
  });

  const initiateNewSwap = async (
    onSuccess: (txHash: string) => void,
    onError: (e: unknown) => void,
  ) => {
    if (!fromAtomicSwap) {
      throw new Error('initiateNewSwap - atomicSwap is not initialized');
    }
    const isConnected = await connector?.isAuthorized();

    if (!isConnected) {
      await connector?.connect();
    }
    writeContract(
      { connector, ...fromAtomicSwap.txParams },
      {
        onSuccess,
        onError,
      },
    );
  };

  const claimSwap = ({
    exchangerSafe,
    onSuccess,
    onError,
  }: {
    exchangerSafe: Trade['exchangerSafe'];
    onSuccess?: (txHash: string) => void;
    onError?: (e: unknown) => void;
  }) => {
    if (isBtcTypeAsset(to)) {
      if (!exchangerSafe) {
        throw new Error('exchangerSafe is not provided');
      }
      unlockSafe({
        secret: remove0x(password),
        secretHash: remove0x(hashedPassword),
        recipientAddress: exchange.clientWalletAddress,
        refundTime: exchangerParams?.responderRefundTime,
        networkName: to.network,
        refundPKH: exchangerParams?.refundPKH,
        utxo: {
          txId: exchangerSafe.transactionHash,
          vout: exchangerSafe.vout,
          value: parseUnits(String(exchangerSafe.amount), 8),
        },
      })
        .then(onSuccess)
        .catch(onError);
    } else {
      atomicService
        .swapClaim({
          swapId: toAtomicSwap.swapId,
          password,
          contractAddress: toAtomicSwapContract,
          rateOfFeeInNative: exchange.coinPair.priceCoin1InUsdt.toString(),
        })
        .then(onSuccess)
        .catch(onError);
    }
  };

  function refundSwap(
    onSuccess?: (txHash: string) => void,
    onError?: (e?: unknown) => void,
  ) {
    writeContract(
      {
        chainId: from.chainId,
        address: fromAtomicSwapContract,
        abi: ATOMIC_SWAP_ABI,
        functionName: 'refundSwap',
        args: [fromAtomicSwap.swapId],
      },
      {
        onSuccess,
        onError,
      },
    );
  }

  return {
    safe1: parseSafe(safe1),
    safe2: parseSafe(safe2),
    hashLock: hashedPassword,
    claimSwap,
    refundSwap,
    initiateNewSwap,
  };
};

function parseSafe(safe: any) {
  if (!safe?.data) {
    return null;
  }
  const [
    recipient,
    sender,
    tokenAddress,
    amount,
    expiration,
    hashLock,
    refunded,
    claimed,
  ] = safe.data;
  return recipient === NULLISH_TOKEN_ADDRESS
    ? null
    : {
        recipient,
        sender,
        tokenAddress,
        amount,
        expiration,
        hashLock,
        refunded,
        claimed,
      };
}
