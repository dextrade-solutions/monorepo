import { networks } from 'bitcoinjs-lib';
import { NetworkNames } from 'dex-helpers';

export const btcNetworksConfig = {
  [NetworkNames.litecoin]: {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bech32: 'ltc',
    bip32: {
      public: 0x019da462,
      private: 0x019d9cfe,
    },
    pubKeyHash: 0x30, // This is the prefix for P2PKH addresses (starts with L)
    scriptHash: 0x32, // This is the prefix for P2SH addresses (starts with M)
    wif: 0xb0, // Wallet import format prefix
  },
  [NetworkNames.bitcoin]: networks.bitcoin,
};
