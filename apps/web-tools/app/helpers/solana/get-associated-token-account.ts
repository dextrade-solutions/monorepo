import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import type { Account } from '@solana/spl-token';
import type {
  Commitment,
  ConfirmOptions,
  Connection,
  PublicKey,
  Signer,
} from '@solana/web3.js';
import { sendAndConfirmTransaction, Transaction } from '@solana/web3.js';

// import { getAccount } from '../state/account.js';
// import { getAssociatedTokenAddressSync } from '../state/mint.js';

/**
 * Retrieve the associated token account, or create it if it doesn't exist
 * @param connection - Connection to use
 * @param mint - Mint associated with the account to set or verify
 * @param owner - Owner of the account to set or verify
 * @param allowOwnerOffCurve - Allow the owner account to be a PDA (Program Derived Address)
 * @param commitment - Desired level of commitment for querying the state
 * @param programId - SPL Token program account
 * @param associatedTokenProgramId - SPL Associated Token program account
 * @returns Address of the new associated token account
 */
export async function getAssociatedTokenAccount(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  commitment?: Commitment,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): Promise<Account> {
  const associatedToken = getAssociatedTokenAddressSync(
    mint,
    owner,
    allowOwnerOffCurve,
    programId,
    associatedTokenProgramId,
  );

  // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
  // Sadly we can't do this atomically.
  const account = await getAccount(
    connection,
    associatedToken,
    commitment,
    programId,
  );
  return account;
}
