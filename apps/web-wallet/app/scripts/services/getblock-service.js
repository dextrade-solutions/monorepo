// Bitcoin 3PBP service api
import BaseService from './base';

const API_KEY = '73529e2a-7fb4-439c-9355-53fb5bb22e84';

const getBaseUrl = (type) => `https://btc.getblock.io/${type}/`;

export default class GetblockServiceApi extends BaseService {
  constructor({ isTestnet }) {
    super({
      apiBaseUrl: getBaseUrl(isTestnet ? 'testnet' : 'mainnet'),
      getApiKey: () => API_KEY,
    });
  }

  /**
   * push transaction to network
   *
   * @param {string} hexstring - The hex string of the raw transaction
   * @param {string} maxfeerate - numeric or string, optional, default=0.10
   * @returns {Promise} fetch response
   */
  async broadcastTransaction(hexstring, maxfeerate = null) {
    const result = await this.request('POST', '', {
      jsonrpc: '2.0',
      method: 'sendrawtransaction',
      params: [hexstring, maxfeerate],
      id: 'getblock.io',
    });
    return result;
  }
}
