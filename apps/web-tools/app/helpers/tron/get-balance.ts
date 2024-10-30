import { tronWeb } from './tronweb';

export default async function getBalance(address: string) {
  try {
    return tronWeb.trx.getBalance(address);
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
}
