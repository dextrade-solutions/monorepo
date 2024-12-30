import { WalletConnectionType } from 'dex-helpers';

export function prefixSignMessageByConnectionType(
  connectionType: WalletConnectionType,
  message: string,
): string {
  switch (connectionType) {
    case WalletConnectionType.eip6963:
    case WalletConnectionType.wcEip155:
      return `\x19Ethereum Signed Message:\n${message.length}${message}`;
    case WalletConnectionType.tronlink:
    case WalletConnectionType.wcTron:
      return `\x19TRON Signed Message:\n${message.length}${message}`;
    default:
      return message;
  }
}
