/**
 * Blockchain.com 3PBP service API
 *
 * Limitations: 1 request per 10 seconds by signle ip
 *
 * When limit is reached user will be banned for 2 hours
 *
 */
import BaseService from './base';

const BASE_URL = 'https://blockchain.info/';

export default class BlockstreamServiceApi extends BaseService {
  constructor() {
    super({
      apiBaseUrl: BASE_URL,
    });
  }

  generateQuery(data) {
    const query = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        query.append(key, String(value));
      }
    });
    return query;
  }

  async request({ method = 'GET', url, params }) {
    const query = this.generateQuery(params);
    const resp = await fetch(`${BASE_URL}${url}?${query.toString()}`, {
      method,
    });
    return resp.json();
  }

  /**
   * Get balance and last transactions by address
   *
   * Optional limit parameter to show n transactions e.g. &limit=50 (Default: 50, Max: 50)
   * Optional offset parameter to skip the first n transactions e.g. &offset=100 (Page 2 for limit 50)
   *
   * @param address - Address can be base58 or hash160
   */
  getAccount(address) {
    return this.request({ url: `rawaddr/${address}` });
  }

  /**
   * Get balance and last transactions by address list
   *
   * Optional limit parameter to show n transactions e.g. &limit=50 (Default: 50, Max: 50)
   * Optional offset parameter to skip the first n transactions e.g. &offset=100 (Page 2 for limit 50)
   *
   * @param {string[]} addresses - Addresses can be base58 or hash160
   */
  async getAccountByList(addresses) {
    const params = {
      active: addresses.join('|'),
    };
    return this.request({ url: 'multiaddr', params });
  }

  /**
   * Unspent Outputs by address
   *
   * Multiple Addresses Allowed separated by "|"
   * Optional limit parameter to show n transactions e.g. &limit=50 (Default: 250, Max: 1000)
   * Optional confirmations parameter to limit the minimum confirmations e.g. &confirmations=6
   *
   * @param address - Address can be base58 or xpub
   */
  async getUnspentOutputs(address) {
    return this.request({
      url: 'unspent',
      params: {
        active: address,
      },
    });
  }
}
