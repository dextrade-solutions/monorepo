import { NetworkNames } from 'dex-helpers';

const ACCESS_TOKEN = {
  [NetworkNames.litecoin]: '1307584ed67e4c35963ad2a173d43367',
};

export default class GetblockServiceApi {
  /**
   * push transaction to network
   * @param {string} hexstring - The hex string of the raw transaction
   * @param network
   * @returns {Promise} fetch response
   */
  static async broadcast(hexstring: string, network: NetworkNames) {
    const data = {
      jsonrpc: '2.0',
      method: 'sendrawtransaction',
      params: [hexstring],
      id: 'getblock.io',
    };
    const result = await fetch(
      `https://go.getblock.io/${ACCESS_TOKEN[network]}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return result;
  }
}
