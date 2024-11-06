import { NetworkNames } from 'dex-helpers';

import { tronWeb } from './tronweb';
import { ledgerConnection } from '../../../ui/helpers/utils/ledger';

export async function signAndBroadcastTx(unsignedTx: any) {
  const { client } = await ledgerConnection.connect(NetworkNames.tron);
  // Sign transaction using Ledger
  const signature = await client.signTransaction(
    "44'/195'/0'/0/0",
    unsignedTx.raw_data_hex,
    [],
  );

  // Attach signature to the transaction
  unsignedTx.signature = [signature];

  const result = await tronWeb.trx.sendRawTransaction(unsignedTx);
  return result.txid;
}
