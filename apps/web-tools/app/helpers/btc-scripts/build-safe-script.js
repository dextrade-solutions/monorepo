import * as bitcoin from 'bitcoinjs-lib';
// const bitcoin = require('bitcoinjs-lib'); // Import BitcoinJS library
// import { genKeyPair } from './app/helpers/atomic-swaps';
// import { remove0x } from '@metamask/utils';
// const crypto = require('crypto');

function intToUint8Array(value) {
  const byteArray = new Uint8Array(4); // 4 bytes for a 32-bit integer
  const dataView = new DataView(byteArray.buffer);
  dataView.setInt32(0, value, false); // false for big-endian
  const result = Array.from(byteArray).filter( // remove leading zeros
    (byte, index) => byte !== 0 || index >= byteArray.findIndex((b) => b !== 0),
  );
  return new Uint8Array(result);
}

export class SwapScriptBuilder {
  bailTxScriptHash(redeemPKH, secretHash, refundPKH, refundTime) {
    const script = this.bailScript(
      redeemPKH,
      secretHash,
      refundPKH,
      refundTime,
    );
    const bailTxScriptHash = bitcoin.crypto.hash160(script);
    return bailTxScriptHash;
  }

  bailScript(redeemPKH, secretHash, refundPKH, refundTime) {
    // const buffer = new Uint8Array(4); // Allocate 4 bytes
    // buffer.writeInt32BE(refundTime);
    // Create the redeem script using bitcoin.script.compile
    const script = bitcoin.script.compile([
      bitcoin.opcodes.OP_IF,
      bitcoin.opcodes.OP_SIZE,
      new Uint8Array([0x20]),
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_SHA256,
      secretHash,
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      redeemPKH,
      bitcoin.opcodes.OP_ELSE,
      intToUint8Array(refundTime).reverse(),
      bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoin.opcodes.OP_DROP,
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      refundPKH,
      bitcoin.opcodes.OP_ENDIF,
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_CHECKSIG,
    ]);
    return script;
  }
}

// Test the conversion with BitcoinJS-lib
// const swapScriptBuilder = new SwapScriptBuilder();
// const redeemPKH = Buffer.from(
//   '76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac',
//   'hex',
// );
// const hashlock = remove0x(genKeyPair().hashLock);
// const secretHash = Buffer.from(hashlock, 'hex');
// console.log('Hash lock:', hashlock);
// const refundPKH = Buffer.from(
//   '76a9140123456789abcdef0123456789abcdef0123456788ac',
//   'hex',
// );
// const refundTime = 500000;

// const scriptHash = swapScriptBuilder.bailTxScriptHash(
//   redeemPKH,
//   secretHash,
//   refundPKH,
//   refundTime,
// );
