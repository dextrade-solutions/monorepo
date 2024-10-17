import { createTransferInstruction } from '@solana/spl-token';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { AssetModel } from 'dex-helpers/types';

import { getAssociatedTokenAccount } from './get-associated-token-account';

const createSendTokenInstruction = async ({
  tokenAddress,
  fromWallet,
  toWallet,
  value,
  connection,
}: {
  fromWallet: PublicKey;
  toWallet: PublicKey;
  connection: Connection;
  tokenAddress: string;
  value: number;
}) => {
  const mint = new PublicKey(tokenAddress);
  const fromTokenAccount = await getAssociatedTokenAccount(
    connection,
    mint,
    fromWallet,
  );

  const toTokenAccount = await getAssociatedTokenAccount(
    connection,
    mint,
    toWallet,
  );

  // Add token transfer instructions to transaction
  return createTransferInstruction(
    fromTokenAccount.address,
    toTokenAccount.address,
    fromWallet,
    value,
  );
};

export const buildTxSol = async ({
  from,
  to,
  connection,
  fromPubkey,
  recepientAddress,
  value,
}: {
  from: AssetModel;
  to: AssetModel;
  connection: Connection;
  fromPubkey: PublicKey;
  value: number;
  recepientAddress: string;
}) => {
  let toPubkey = new PublicKey(recepientAddress);
  if (to.contract) {
    const mint = new PublicKey(to.contract);
    const toTokenAccount = await getAssociatedTokenAccount(
      connection,
      mint,
      toPubkey,
    );
    toPubkey = toTokenAccount.address;
  }

  const transaction = new Transaction();
  let sendInstruction;
  if (from.contract) {
    sendInstruction = await createSendTokenInstruction({
      connection,
      fromWallet: fromPubkey,
      toWallet: toPubkey,
      tokenAddress: from.contract,
      value,
    });
  } else {
    sendInstruction = SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: value,
    });
  }

  transaction.add(sendInstruction);

  return transaction;
};
