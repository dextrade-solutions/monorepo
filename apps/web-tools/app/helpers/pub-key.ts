import { ecrecover, toBuffer } from 'ethereumjs-util';
import Web3 from 'web3';

const web3 = new Web3();

export const recoverPubKeyFromSignature = (
  signature: string,
  message: string,
) => {
  const messageHash = web3.utils.keccak256(
    `\x19Ethereum Signed Message:\n${message.length}${message}`,
  );

  // Extract r, s, v from the signature
  const sig = signature.slice(2);
  const r = Buffer.from(sig.slice(0, 64), 'hex');
  const s = Buffer.from(sig.slice(64, 128), 'hex');
  const v = web3.utils.toDecimal(`0x${sig.slice(128, 130)}`);

  // Recover the public key
  const pubKey = ecrecover(toBuffer(messageHash), v, r, s);

  return pubKey;
};
