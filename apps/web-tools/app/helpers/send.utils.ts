import abi from 'ethereumjs-abi';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';

const TOKEN_TRANSFER_FUNCTION_SIGNATURE = '0xa9059cbb';
const NFT_TRANSFER_FROM_FUNCTION_SIGNATURE = '0x23b872dd';

export function generateERC20TransferData({
  toAddress = '0x0',
  amount = '0x0',
}) {
  return (
    TOKEN_TRANSFER_FUNCTION_SIGNATURE +
    Array.prototype.map
      .call(
        abi.rawEncode(
          ['address', 'uint256'],
          [addHexPrefix(toAddress), addHexPrefix(amount)],
        ),
        (x) => `00${x.toString(16)}`.slice(-2),
      )
      .join('')
  );
}

export function generateERC721TransferData({
  toAddress = '0x0',
  fromAddress = '0x0',
  tokenId,
}) {
  if (!tokenId) {
    return undefined;
  }
  return (
    NFT_TRANSFER_FROM_FUNCTION_SIGNATURE +
    Array.prototype.map
      .call(
        abi.rawEncode(
          ['address', 'address', 'uint256'],
          [addHexPrefix(fromAddress), addHexPrefix(toAddress), tokenId],
        ),
        (x) => `00${x.toString(16)}`.slice(-2),
      )
      .join('')
  );
}

// TRON transfer trc20
export function generateTRC20TransferData({ toAddress, amount }) {
  return stripHexPrefix(
    utils.abi.encodeParams(['address', 'uint256'], [toAddress, amount]),
  );
}
