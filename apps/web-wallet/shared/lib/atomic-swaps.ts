import { encodePacked, keccak256, encodeFunctionData } from 'viem';

import { BUILT_IN_NETWORKS, ChainId } from '../constants/network';
import { AssetModel } from './asset-model';

export const ATOMIC_SWAP_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'swapId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address payable',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'hashLock',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'expiration',
        type: 'uint256',
      },
    ],
    name: 'NewSwapInitiated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'swapId',
        type: 'bytes32',
      },
    ],
    name: 'SwapClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'swapId',
        type: 'bytes32',
      },
    ],
    name: 'SwapRefunded',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'swapId',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'hashLock',
        type: 'bytes32',
      },
    ],
    name: 'claimSwap',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'hashLock',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'expiration',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'initiateNewSwap',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'swapId',
        type: 'bytes32',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'swapId',
        type: 'bytes32',
      },
    ],
    name: 'refundSwap',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'swaps',
    outputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'address payable',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expiration',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'hashLock',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: 'refunded',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'claimed',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const NULLISH_TOKEN_ADDRESS =
  '0x0000000000000000000000000000000000000000';

/**
 *
 * @param password - bytes32 encoded password
 * @returns hashed keccak256 string
 */
export function hashPassword(password: `0x${string}`) {
  return keccak256(encodePacked(['bytes32'], [password]));
}

export type AtomicSwapParams = {
  msgSender: `0x${string}`;
  recipient: `0x${string}`;
  tokenAddress?: `0x${string}`;
  amount: bigint;
  hashLock: `0x${string}`;
  expiration: bigint;
};

export function generateAtomicSwapTransferData({
  recipient,
  tokenAddress,
  amount,
  hashLock,
  expiration,
}: AtomicSwapParams) {
  const contract = tokenAddress || NULLISH_TOKEN_ADDRESS;
  return encodeFunctionData({
    abi: ATOMIC_SWAP_ABI,
    functionName: 'initiateNewSwap',
    args: [recipient, hashLock, expiration / 1000n, contract, amount],
  });
}

export function getAtomicSwapId({
  msgSender,
  recipient,
  tokenAddress,
  amount,
  hashLock,
  expiration,
}: AtomicSwapParams) {
  const contract = tokenAddress || NULLISH_TOKEN_ADDRESS;
  const secondsExpiration = expiration / 1000n;
  const encodedData = encodePacked(
    ['address', 'address', 'address', 'uint256', 'bytes32', 'uint256'],
    [msgSender, recipient, contract, amount, hashLock, secondsExpiration],
  );

  // Compute the keccak256 hash
  const swapId = keccak256(encodedData);

  return swapId;
}

export function generateAtomicSwapParams(
  chainId: ChainId,
  recipient: `0x${string}`,
  hashLock: `0x${string}`,
  expiration: bigint,
  amount: bigint,
  tokenAddress?: `0x${string}`,
) {
  const netConfig = BUILT_IN_NETWORKS[chainId];
  const secondsExpiration = expiration / 1000n;
  if (!netConfig.atomicSwapContract) {
    throw new Error(
      `initiateNewAtomicSwap - chainId ${chainId} is not support atomic swap`,
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
  sender: `0x${string}`,
  recipient: `0x${string}`,
  password: `0x${string}`,
  expiration: bigint,
  amount: bigint,
) {
  const hashedPassword = hashPassword(password);
  const txParams = generateAtomicSwapParams(
    asset.network,
    recipient,
    hashedPassword,
    expiration,
    amount,
    NULLISH_TOKEN_ADDRESS,
  );

  const swapId = getAtomicSwapId({
    msgSender: sender,
    recipient,
    expiration,
    amount,
    hashLock: hashedPassword,
  });
  return {
    hashedPassword,
    swapId,
    txParams,
  };
}

export const readAtomicSwapContract = (swapId: string) => {
  readContract;
};
