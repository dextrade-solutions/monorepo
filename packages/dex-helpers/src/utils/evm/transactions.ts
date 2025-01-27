import { ethers } from 'ethers';
import { parseUnits } from 'viem';
import { AssetModel } from '../../../types';

export const TOKEN_TRANSFER_FUNCTION_SIGNATURE = '0xa9059cbb';

/**
 * Ensures a string has a "0x" prefix. If the string already has the prefix,
 * it is returned unchanged. If not, the prefix is added.
 *
 * @param {string} value - The string to which the hex prefix should be added.
 * @returns {string} - The string with a "0x" prefix.
 */
export function addHexPrefix(value) {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }

  return value.startsWith('0x') ? value : `0x${value}`;
}

export function generateERC20TransferData({
  toAddress = '0x0',
  amount = '0x0',
}) {
  const abi = ['function transfer(address to, uint256 amount)'];
  const iface = new ethers.Interface(abi);

  return iface.encodeFunctionData('transfer', [toAddress, amount]);
}

export const generateEvmTxParams = ({
  contractAddress,
  from,
  to,
  value,
}: {
  contractAddress?: string;
  from?: string;
  to: string;
  value: bigint;
}) => {
  let data;
  if (contractAddress) {
    data = generateERC20TransferData({
      toAddress: to,
      amount: addHexPrefix(value.toString(16)),
    });
    return { from, to: contractAddress, data };
  }
  return {
    from,
    to,
    value,
    data,
  };
};

export const generateTxParams = ({
  asset,
  from,
  to,
  value,
}: {
  asset: AssetModel;
  from?: string;
  to: string;
  value: bigint;
}) => {
  if (!asset.decimals) {
    throw new Error('generateTxParams - no decimals provided');
  }

  return {
    chainId: asset.chainId,
    ...generateEvmTxParams({
      contractAddress: asset.contract,
      from,
      to,
      value,
    }),
  };
};
