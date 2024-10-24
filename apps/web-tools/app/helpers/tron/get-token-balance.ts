import { tronWeb } from './tronweb';

export default async function getTokenBalance(
  address: string,
  contract: string,
) {
  tronWeb.setAddress(address);
  const abi = await tronWeb.contract().at(contract);
  const balance = await abi.balanceOf(address).call();
  return balance;
}
