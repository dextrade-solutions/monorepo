import { tronWeb } from './tronweb';

export default async function buildTx(
  fromAddress: string,
  toAddress: string,
  value: number,
) {
  try {
    // Create raw TRX transaction
    const unsignedTx = await tronWeb.transactionBuilder.sendTrx(
      toAddress,
      value,
      fromAddress,
    );

    return unsignedTx;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}
