import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

export const buildTxSol = ({
  fromPubkey,
  recepientAddress,
  value,
}: {
  fromPubkey: PublicKey;
  value: number;
  recepientAddress: string;
}) => {
  const toPubkey = new PublicKey(recepientAddress);

  const transaction = new Transaction();
  const sendSolInstruction = SystemProgram.transfer({
    fromPubkey,
    toPubkey,
    lamports: value,
  });

  transaction.add(sendSolInstruction);

  return transaction;
};
