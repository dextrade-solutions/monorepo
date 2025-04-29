import { WalletConnectionType } from '../constants';

function createCustomEthereumSignedMessage(message: string): Uint8Array {
  const magicByte = 0x19;
  const versionByte = 0x45; // 'E'
  const humanReadablePrefix = "thereum Signed Message:\n" + message.length;

  const prefixBytes = new Uint8Array([
    magicByte,
    versionByte,
    ...new TextEncoder().encode(humanReadablePrefix),
  ]);

  const messageBytes = new TextEncoder().encode(message);

  // Combine all bytes into one Uint8Array
  const fullMessage = new Uint8Array(prefixBytes.length + messageBytes.length);
  fullMessage.set(prefixBytes);
  fullMessage.set(messageBytes, prefixBytes.length);

  return fullMessage;
}

export function prefixSignMessageByConnectionType(
  connectionType: WalletConnectionType,
  message: string,
): string {
  switch (connectionType) {
    case WalletConnectionType.eip6963:
      return `\x19Ethereum Signed Message:\n${message.length}${message}`;
    case WalletConnectionType.tronlink:
    case WalletConnectionType.wcTron:
      return `\x19TRON Signed Message:\n${message.length}${message}`;
    default:
      return message;
  }
}
