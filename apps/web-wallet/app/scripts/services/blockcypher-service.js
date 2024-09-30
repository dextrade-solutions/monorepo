// Bitcoin 3PBP service api
import { handleFetch } from '../../overrided-metamask/controller-utils';
import BaseService from './base';

const BTC_API_SERVICE = {
  mainnet: 'https://api.blockcypher.com/v1/btc/main',
  testnet: 'https://api.blockcypher.com/v1/btc/test3',
};

// const API_TOKEN = '1053021b7c7942619e458e6ac7a1aba0';

class BlockcypherServiceApi extends BaseService {
  constructor({ isTestnet }) {
    super({
      apiBaseUrl: isTestnet ? BTC_API_SERVICE.testnet : BTC_API_SERVICE.mainnet,
    });
  }

  async request(method, url, data, query) {
    const { data: result } = await handleFetch(this._makeUrl(url, query), {
      method,
      body: data ? JSON.stringify(data) : undefined,
    });
    return result;
  }

  /**
   * get balance, utxo and etc...
   *
   * @param {string} address - account address
   * @returns {Promise} fetch response
   */
  async getAddressInfo(address) {
    const result = await this.request('GET', `/addrs/${address}`, null, {
      unspentOnly: true,
    });
    return result;
  }

  getNetInfo() {
    return this.request('GET', '');
  }

  getTransaction(hash) {
    return this.request('GET', `/txs/${hash}`);
  }

  async initTransaction(from, to, satoshis) {
    const payloads = {
      inputs: [
        {
          addresses: [from],
        },
      ],
      outputs: [
        {
          addresses: [to],
          value: satoshis,
        },
      ],
    };
    return this.request('POST', `/txs/new`, payloads);
  }

  /**
   * push transaction to network
   *
   * @param {string} transaction - bitcoin transaction hex-string
   * @returns {Promise} fetch response
   */
  async broadcastTransaction(transaction) {
    const result = await this.request('POST', '/txs/push', {
      tx: transaction,
    });
    return result;
  }
}

export default BlockcypherServiceApi;
