import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
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
  toAddress,
  value,
  connection,
}: {
  fromWallet: PublicKey;
  toAddress: PublicKey;
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

  // Add token transfer instructions to transaction
  return createTransferInstruction(
    fromTokenAccount.address,
    toAddress,
    fromWallet,
    value,
  );
};

export const buildTxSol = async ({
  asset,
  connection,
  fromPubkey,
  recipientAddress,
  value,
}: {
  asset: AssetModel;
  connection: Connection;
  fromPubkey: PublicKey;
  value: number;
  recipientAddress: string;
}) => {
  const toPubkey = new PublicKey(recipientAddress);

  const transaction = new Transaction();
  let sendInstruction;
  if (asset.contract) {
    const mint = new PublicKey(asset.contract);
    let toAddress;
    try {
      toAddress = (await getAssociatedTokenAccount(connection, mint, toPubkey))
        .address;
    } catch {
      // no associated token account created
      toAddress = getAssociatedTokenAddressSync(mint, toPubkey);
      transaction.add(
        createAssociatedTokenAccountInstruction(
          fromPubkey,
          toAddress,
          toPubkey,
          mint,
        ),
      );
    }
    sendInstruction = await createSendTokenInstruction({
      connection,
      fromWallet: fromPubkey,
      toAddress,
      tokenAddress: asset.contract,
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
