import { WalletConnectionType } from 'dex-helpers';

export function prefixSignMessageByConnectionType(
  connectionType: WalletConnectionType,
  message: string,
): string {
  switch (connectionType) {
    case WalletConnectionType.eip6963:
      return `\x19Ethereum Signed Message:\n${message.length}${message}`;
    case WalletConnectionType.tronlink:
      return `\x19TRON Signed Message:\n${message.length}${message}`;
    default:
      return message;
  }
}
