import { tronWeb } from './tronweb';

export default async function getBalance({
  address,
  contract,
}: {
  address: string;
  contract?: string;
}) {
  if (contract) {
    tronWeb.setAddress(address);
    const abi = await tronWeb.contract().at(contract);
    const balance = await abi.balanceOf(address).call();
    return balance;
  }
  const result = await tronWeb.trx.getBalance(address);
  return BigInt(result || 0);
}
