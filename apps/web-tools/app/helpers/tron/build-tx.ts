import { tronWeb } from './tronweb';

export default async function buildTx(
  fromAddress: string,
  toAddress: string,
  value: string,
  contract?: string,
  // tronwebInstance = tronWeb,
) {
  try {
    let unsignedTx;

    if (contract) {
      const functionSelector = 'transfer(address,uint256)';
      const params = [
        { type: 'address', value: toAddress },
        { type: 'uint256', value },
      ];
      const { transaction } =
        await tronWeb.transactionBuilder.triggerSmartContract(
          contract,
          functionSelector,
          {},
          params,
          fromAddress,
        );
      unsignedTx = transaction;
    } else {
      // Create raw TRX transaction
      unsignedTx = await tronWeb.transactionBuilder.sendTrx(
        toAddress,
        Number(value),
        fromAddress,
      );
    }

    unsignedTx = await tronWeb.transactionBuilder.extendExpiration(
      unsignedTx,
      10 * 60, // 10 minutes
    );

    return unsignedTx;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}
