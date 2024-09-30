import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

import { SwapScriptBuilder } from './build-safe-script';
import { hash160 } from './utils';

const swapBuilder = new SwapScriptBuilder();

const ECPair = ECPairFactory(ecc);

export const getRedeemKeypair = () => {
  return ECPair.fromPrivateKey(
    Buffer.from(
      '4ce0b40827ab6323a139553e4980249fb92501fb6d1293736b4817dd001a9b55',
      'hex',
    ),
  );
};

export const getKeysAndRedeemScript = (
  secretHash: string,
  refundTime: number,
  refundPKH: string,
) => {
  // const refundKeypair = ECPair.fromPrivateKey(
  //   Buffer.from(
  //     'ae20b55afe47e949d9f9533fa4e27096168eb05f9e87a61fc4c42ffaee3a1003',
  //     'hex',
  //   ),
  // );
  const redeemKeypair = getRedeemKeypair();
  const redeemPkHash = hash160(redeemKeypair.publicKey);
  // const refundPkHash = hash160(refundKeypair.publicKey);

  const redeemScript = swapBuilder.bailScript(
    redeemPkHash,
    Buffer.from(secretHash, 'hex'),
    Buffer.from(refundPKH, 'hex'),
    refundTime,
  );
  console.info(
    'redeem script hash: ',
    Buffer.from(
      swapBuilder.bailTxScriptHash(
        redeemPkHash,
        Buffer.from(secretHash, 'hex'),
        Buffer.from(refundPKH, 'hex'),
        refundTime,
      ),
    ).toString('hex'),
  );
  return {
    redeemPKH: redeemPkHash.toString('hex'),
    redeemKeypair,
    redeemScript,
  };
};
