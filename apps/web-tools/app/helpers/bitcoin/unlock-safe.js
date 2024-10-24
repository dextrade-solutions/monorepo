import * as bitcoin from 'bitcoinjs-lib';
import { sha256 } from 'viem';

import { getKeysAndRedeemScript } from './get-keys-and-redeem-script';
import { btcNetworksConfig } from './networks';
import { idToHash } from './utils';
import GetblockServiceApi from '../../services/getblock';

const broadcast = (txHash, networkName) => {
  console.info('Broadcasting rawTx:', txHash);
  return GetblockServiceApi.broadcast(txHash, networkName);
};

export const unlockSafe = async ({
  secret,
  secretHash,
  refundTime,
  refundPKH,
  recepientAddress,
  networkName,
  utxo,
  feeRate = 20n,
}) => {
  const network = btcNetworksConfig[networkName];
  const { redeemScript, redeemKeypair } = getKeysAndRedeemScript(
    secretHash,
    refundTime,
    refundPKH,
  );
  const tx = new bitcoin.Transaction({ network });
  tx.version = 2;
  tx.addInput(idToHash(utxo.txId), 0, 0xfffffffe);
  const alicePayment = bitcoin.payments.p2pkh({
    address: 'LU53hQLz2XEK74ZeBjkDYctnXFEjKZ4gUA' || recepientAddress,
    network,
  });

  const inputSize = 148; // Approximate size for a P2PKH input
  const outputSize = 34; // Approximate size for a P2PKH output
  const txBaseSize = 10; // Base size of the transaction
  const txSize = txBaseSize + inputSize + outputSize; // Estimate total tx size

  const fee = BigInt(txSize) * feeRate;

  tx.addOutput(alicePayment.output, utxo.value - fee);
  const signatureHash = tx.hashForSignature(
    0,
    redeemScript,
    bitcoin.Transaction.SIGHASH_ALL,
  );
  const redeemScriptSig = bitcoin.payments.p2sh({
    redeem: {
      input: bitcoin.script.compile([
        bitcoin.script.signature.encode(
          redeemKeypair.sign(signatureHash),
          bitcoin.Transaction.SIGHASH_ALL,
        ),
        redeemKeypair.publicKey,
        Buffer.from(secret, 'hex'),
        Buffer.from([0x01]),
      ]),
      output: redeemScript,
    },
  }).input;
  tx.setInputScript(0, redeemScriptSig);
  const txHash = tx.toHex();
  await broadcast(txHash, networkName);
  return sha256(txHash);
};
