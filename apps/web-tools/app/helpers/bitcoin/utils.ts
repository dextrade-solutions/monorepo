import { remove0x } from '@metamask/utils';
import * as bitcoin from 'bitcoinjs-lib';
import { reverseBuffer } from 'bitcoinjs-lib/src/bufferutils';
import * as tools from 'uint8array-tools';
import { ripemd160, sha256 } from 'viem';

// Generate Alice's Litecoin address
export function getKeypairAddress(keypair, network) {
  const { address } = bitcoin.payments.p2pkh({
    pubkey: keypair.publicKey,
    network,
  });
  return address;
}

export function idToHash(txid) {
  return reverseBuffer(tools.fromHex(txid));
}

export function hash160(pubkey) {
  const v = sha256(pubkey);
  const result = remove0x(ripemd160(v));
  return Buffer.from(result, 'hex');
}
