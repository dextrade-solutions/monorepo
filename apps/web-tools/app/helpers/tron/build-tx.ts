import { tronWeb } from './tronweb';

export default async function buildTx(
  fromAddress: string,
  toAddress: string,
  value: string,
  contract?: string,
  tronwebInstance = tronWeb,
) {
  try {
    let unsignedTx;

    if (contract) {
      // Interact with the contract to send value
      const functionSelector = 'transfer(address,uint256)';
      const params = [
        { type: 'address', value: toAddress }, // Recipient address
        { type: 'uint256', value }, // Amount to transfer
      ];
      const { transaction } =
        await tronWeb.transactionBuilder.triggerSmartContract(
          contract, // Contract address
          functionSelector, // Function to call
          {
            feeLimit: 10000000, // Fee limit for transaction
          },
          params,
          fromAddress, // Sender address
        );
      unsignedTx = transaction;
    } else {
      // Create raw TRX transaction
      unsignedTx = await tronwebInstance.transactionBuilder.sendTrx(
        toAddress,
        Number(value),
        fromAddress,
      );
    }

    return unsignedTx;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}
