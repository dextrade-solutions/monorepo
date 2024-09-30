// Bitcoin 3PBP service api
import BaseService from './base';

const API_KEY = '73529e2a-7fb4-439c-9355-53fb5bb22e84';

const getBaseUrl = (type) => `https://blockstream.info/${type}/api`;

export default class BlockstreamServiceApi extends BaseService {
  constructor({ isTestnet }) {
    super({
      apiBaseUrl: getBaseUrl(isTestnet ? 'testnet' : 'mainnet'),
      getApiKey: () => API_KEY,
    });
  }

  async getBalance(address) {
    const result = await this.publicRequest('GET', `/address/${address}`);
    return result.chain_stats.funded_txo_sum;
  }
}
