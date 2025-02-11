import { PublicKey } from '@solana/web3.js';
import * as bitcoin from 'bitcoinjs-lib';
import { NetworkNames, NetworkTypes, tronWeb } from 'dex-helpers';
import * as ecc from 'tiny-secp256k1';
import { isAddress } from 'viem';

import { btcNetworksConfig } from '../../../app/helpers/bitcoin/networks'; // Import tiny-secp256k1

bitcoin.initEccLib(ecc);

export function getAddressValidator(
  networkName: NetworkNames,
  networkType?: NetworkTypes,
) {
  switch (networkName) {
    case NetworkNames.ethereum:
    case NetworkNames.binance:
    case NetworkNames.polygon:
    case NetworkNames.humanode:
    case NetworkNames.arbitrum:
    case NetworkNames.sepolia:
    case NetworkNames.xdc:
    case NetworkNames.gnosis:
      return (address: string) =>
        !isAddress(address) &&
        `Invalid ${networkName} address. Please ensure the address is a valid hexadecimal string starting with "0x" and containing 42 characters.`;

    case NetworkNames.bitcoin:
      const network = btcNetworksConfig[networkName];
      return (address: string) => {
        try {
          switch (networkType) {
            case NetworkTypes.bip44: // P2PKH (legacy)
              bitcoin.payments.p2pkh({
                address,
                network,
              });
              break;
            case NetworkTypes.bip49: // P2SH-P2WPKH (nested SegWit)
              bitcoin.payments.p2sh({
                address,
                network,
              });
              break;
            case NetworkTypes.bip84: // P2WPKH (native SegWit)
              bitcoin.payments.p2wpkh({
                address,
                network,
              });
              break;
            case NetworkTypes.bip86: // P2TR
              bitcoin.payments.p2tr({
                address,
                network,
              });
              break;
            default:
              return `Unknown ${networkType} format`; // Invalid network type
          }
          return false; // Address is valid for the given type
        } catch (error) {
          console.error(error);
          return `Address is not presented in ${networkType} format`; // Address is invalid
        }
      };

    case NetworkNames.solana:
      return (address: string) => {
        try {
          new PublicKey(address); // Try creating a PublicKey object
          return false; // No error, address is valid
        } catch (error) {
          return 'Invalid Solana address.';
        }
      };

    case NetworkNames.tron:
      return (address: string) => {
        try {
          // Use TronWeb's isAddress function for validation
          const isValid = tronWeb.isAddress(address);
          return !isValid && 'Invalid Tron address.';
        } catch (error) {
          return 'Invalid Tron address.';
        }
      };
    case NetworkNames.multiversx:
      // Add Tron and MultiversX address validation if needed
      return () => false; // Placeholder

    default:
      return () => false; // Default: invalid for unknown networks
  }
}
