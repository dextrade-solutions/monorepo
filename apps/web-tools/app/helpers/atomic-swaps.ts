import { BUILT_IN_NETWORKS, NetworkNames } from 'dex-helpers';
import { addHexPrefix } from 'ethereumjs-util';
import { encodePacked, sha256 } from 'viem';

import { ATOMIC_SWAP_ABI } from '../constants/abi';
import { AssetModel } from '../types/p2p-swaps';

export const NULLISH_TOKEN_ADDRESS =
  '0x0000000000000000000000000000000000000000';

/**
 *
 * @param password - bytes32 encoded password
 * @returns hashed keccak256 string
 */
export function hashPassword(password: `0x${string}`) {
  return sha256(encodePacked(['bytes32'], [password]));
}

export function genKeyPair() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  const newPassword = addHexPrefix(
    Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
  );
  const hashLock = hashPassword(newPassword);
  // return {
  //   hashLock:
  //     '7bb3d06707985d4cac0d4c25253932a44a41d1853cdcd7edaffa39f1a6a1963b',
  //   password:
  //     '067ede212a18a416191afcb8bd1a82159d05c607568ab7e90ee7e84886a35949',
  // };
  return { hashLock, password: newPassword };
}

export function getTradeKeyPair(tradeId: string) {
  const tradeKeys = window.localStorage.getItem(tradeId);
  return tradeKeys
    ? JSON.parse(tradeKeys)
    : {
        hashLock: null,
        password: null,
      };
}

export type AtomicSwapParams = {
  msgSender: `0x${string}`;
  recepient: `0x${string}`;
  tokenAddress: `0x${string}`;
  amount: bigint;
  hashLock: `0x${string}`;
  expiration: bigint;
};

export type AtomicSwapTxParams = {
  address: string;
  abi: typeof ATOMIC_SWAP_ABI;
  functionName: 'initiateNewSwap';
  args: string | bigint[];
  value?: string;
};

export type BuildedAtomicSwap = {
  txParams: AtomicSwapTxParams;
  swapId: string;
  hashedPassword: string;
};

export function getAtomicSwapId({
  msgSender,
  recepient,
  tokenAddress,
  amount,
  hashLock,
  expiration,
}: AtomicSwapParams) {
  const contract = tokenAddress || NULLISH_TOKEN_ADDRESS;
  const secondsExpiration = expiration / 1000n;
  const encodedData = encodePacked(
    ['address', 'address', 'address', 'uint256', 'bytes32', 'uint256'],
    [msgSender, recepient, contract, amount, hashLock, secondsExpiration],
  );

  const swapId = sha256(encodedData);

  return swapId;
}

export function generateAtomicSwapParams(
  network: NetworkNames,
  recipient: `0x${string}`,
  hashLock: `0x${string}`,
  expiration: bigint,
  amount: bigint,
  tokenAddress?: `0x${string}`,
) {
  const secondsExpiration = expiration / 1000n;
  const netConfig = BUILT_IN_NETWORKS[network];
  if (!netConfig.atomicSwapContract) {
    throw new Error(
      `initiateNewAtomicSwap - network ${network} is not support atomic swap`,
    );
  }
  return {
    address: netConfig.atomicSwapContract,
    abi: ATOMIC_SWAP_ABI,
    functionName: 'initiateNewSwap',
    args: [
      recipient,
      hashLock,
      secondsExpiration,
      tokenAddress || NULLISH_TOKEN_ADDRESS,
      amount,
    ],
    value: tokenAddress ? undefined : amount,
  };
}

export function buildAtomicSwap(
  asset: AssetModel,
  sender: `0x${string}` | string,
  recepient: `0x${string}` | string,
  hashLock: `0x${string}`,
  expiration: bigint,
  amount: bigint,
) {
  if (asset.chainId) {
    const tokenAddress = asset.contract;
    const txParams = generateAtomicSwapParams(
      asset.network,
      recepient,
      hashLock,
      expiration,
      amount,
      tokenAddress,
    );

    const swapId = getAtomicSwapId({
      msgSender: sender,
      recepient,
      expiration,
      amount,
      hashLock,
      tokenAddress,
    });
    return {
      swapId,
      txParams,
    };
  }
  return {
    swapId: null,
    txParams: null,
  };
}
