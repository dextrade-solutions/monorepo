import Trx from '@ledgerhq/hw-app-trx';

import { tronWeb } from './tronweb';
import { ledgerConnection } from '../../../ui/helpers/utils/ledger';

export async function signAndBroadcastTx(unsignedTx: any) {
  await ledgerConnection.connectTron();
  const { transport } = ledgerConnection;
  const trxApp = new Trx(transport);

  // Sign transaction using Ledger
  const signature = await trxApp.signTransaction(
    "44'/195'/0'/0/0",
    unsignedTx.raw_data_hex,
    [],
  );

  // Attach signature to the transaction
  unsignedTx.signature = [signature];

  const result = await tronWeb.trx.sendRawTransaction(unsignedTx);
  return result.txid;
}
