import BigNumber from 'bignumber.js';
import { addHexPrefix } from 'ethereumjs-util';
import { encodeFunctionData, parseEther, parseUnits } from 'viem';

import { genKeyPair, generateAtomicSwapParams } from './atomic-swaps';
import { generateERC20TransferData } from './send.utils';
import { AssetModel } from '../types/p2p-swaps';

type Params = {
  asset: AssetModel;
  amount: number | string;
  from?: string;
  to: string;
  isAtomicSwap?: boolean;
};

export function generateTxParams({
  asset,
  amount,
  from,
  to: destinationAddress,
  isAtomicSwap,
}: Params) {
  let data, value;

  try {
    // Attempt to parse the amount directly
    value = parseUnits(String(amount), asset.decimals);
  } catch (error) {
    // If direct parsing fails (e.g., due to scientific notation), use BigNumber
    const amountBN = new BigNumber(amount);
    if (amountBN.isNaN()) {
      throw new Error(`Invalid amount: ${amount}`); // Or handle the error differently
    }
    value = amountBN.shiftedBy(asset.decimals).toFixed(0); // Shift and convert to string
    value = BigInt(value); // Convert string to BigInt for viem
  }
  if (isAtomicSwap) {
    const callContractData = generateAtomicSwapParams(
      asset.network,
      destinationAddress,
      genKeyPair().hashLock,
      999999999n,
      value,
      asset.contract,
    );
    return {
      from,
      to: destinationAddress,
      data: encodeFunctionData(callContractData),
      value: callContractData.value,
    };
  }

  let to = destinationAddress;
  if (asset.contract) {
    data = generateERC20TransferData({
      toAddress: destinationAddress,
      amount: addHexPrefix(value.toString(16)),
    });
    to = asset.contract;
    return { from, to, data };
  }
  value = parseEther(String(amount));

  return {
    from,
    to,
    value,
    data,
  };
}

export const generateEvmTxParams = ({ contractAddress, from, to, value }) => {
  let data;
  if (contractAddress) {
    data = generateERC20TransferData({
      toAddress: to,
      amount: addHexPrefix(value.toString(16)),
    });
    return { from, to, data };
  }
  return {
    from,
    to,
    value,
    data,
  };
};
