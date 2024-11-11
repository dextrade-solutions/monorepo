import { remove0x } from '@metamask/utils';
import { BUILT_IN_NETWORKS } from 'dex-helpers';
import { AssetModel, Trade } from 'dex-helpers/types';
import { useCallback } from 'react';
import { parseEther, parseUnits } from 'viem';
import { useReadContract, useWalletClient, useWriteContract } from 'wagmi';

import { useAuthWallet } from './useAuthWallet';
import { ATOMIC_SWAP_ABI } from '../../app/constants/abi';
import { SECOND } from '../../app/constants/time';
import {
  NULLISH_TOKEN_ADDRESS,
  buildAtomicSwap,
  getTradeKeyPair,
} from '../../app/helpers/atomic-swaps';
import { unlockSafe } from '../../app/helpers/bitcoin/unlock-safe';
import { isBtcTypeAsset } from '../../app/helpers/chain-helpers/is-btc-type-asset';
import useAsset from './asset/useAsset';

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

  const toSpendAmount = BigInt(parseEther(exchange.amount1.toFixed(18)));
  const exchangerParams = getParsedExchangerParams(exchange);
  const toReceiveAmount =
    exchangerParams?.responderAmount ||
    BigInt(parseEther(exchange.amount2.toFixed(18)));

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
    onError: (e: any) => void,
  ) => {
    // EXAMPLE:
    // const msgSender = '0x14105076F374Afc0a77404D29448F66643311ca9';
    // const recipient = '0x8b71d2EEbfbf321B9CfBB313c71b887f1cfE71db';
    // const amount = BigInt(4999780803690692);
    // const hashLock = this.hashPassword(password); // 0xc0f65f42c82cda15c51228e342b24f179394a98aca35e896c96026d7d07561ba
    if (!fromAtomicSwap) {
      throw new Error('initiateNewSwap - atomicSwap is not initialized');
    }
    writeContract(
      { connector, ...fromAtomicSwap.txParams },
      {
        onSuccess,
        onError,
      },
    );
  };

  const claimSwap = useCallback(
    (onSuccess?: (txHash: string) => void, onError?: (e: any) => void) => {
      if (isBtcTypeAsset(to)) {
        if (!exchange.exchangerSafe) {
          throw new Error('exchangerSafe is not provided in trade');
        }
        unlockSafe({
          secret: remove0x(password),
          secretHash: remove0x(hashedPassword),
          recipientAddress: exchange.clientWalletAddress,
          refundTime: exchangerParams?.responderRefundTime,
          networkName: to.network,
          refundPKH: exchangerParams?.refundPKH,
          utxo: {
            txId: exchange.exchangerSafe.transactionHash,
            vout: exchange.exchangerSafe.vout,
            value: parseUnits(String(exchange.exchangerSafe.amount), 8),
          },
        })
          .then(onSuccess)
          .catch(onError);
      } else {
        writeContract(
          {
            chainId: to.chainId,
            address: toAtomicSwapContract,
            abi: ATOMIC_SWAP_ABI,
            functionName: 'claimSwap',
            args: [toAtomicSwap.swapId, password],
          },
          {
            onSuccess,
            onError,
          },
        );
      }
    },
    [
      exchange,
      exchangerParams,
      password,
      hashedPassword,
      to,
      writeContract,
      toAtomicSwapContract,
      toAtomicSwap?.swapId,
    ],
  );

  function refundSwap(
    onSuccess?: (txHash: string) => void,
    onError?: (e: any) => void,
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
        onError: (e) => {
          console.error(e.message);
        },
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
