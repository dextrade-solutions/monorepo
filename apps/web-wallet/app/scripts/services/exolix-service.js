import BaseService from './base';

// https://exolix.com/developers

const VERSION_URL = 'v2';
const BASE_URL = `https://exolix.com/api/${VERSION_URL}`;
// TODO: get token from env
const TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluZm9AZGV4dHJhZGUuY29tIiwic3ViIjoyNzk2MSwiaWF0IjoxNjk5MjU1MzA5LCJleHAiOjE4NTcwNDMzMDl9.GyjO7i2nvg0hyuECz8_o6FLZbo4IhrkXiZqNzqPEMzo';

export default class ExolixService extends BaseService {
  constructor() {
    super({
      apiBaseUrl: BASE_URL,
      getApiKey: () => TOKEN,
      authHeader: 'Authorization',
    });
  }

  /**
   * List of available currencies
   *
   * @param {Object} params - optional - request param
   * @param {number} params.page - optional - Current page
   * @param {number} params.size - optional - Size per page
   * @param {string} params.search - optional - Search by currency code or name
   * @param {boolean} params.withNetworks - optional - Show currency with networks: true/false. Default: false
   * @returns {Promise<{code: string, name: string, icon: string, notes: string}[]>} Promise array of object (code/name/icon/notes)
   */
  async currencies(params = {}) {
    const { data } = await this.request('GET', '/currencies', null, params);
    return data;
  }

  /**
   * Rate for a specific currency
   *
   * @param {Object} params - request param
   * @param {string} params.coinFrom - required - Currency to exchange from
   * @param {string} params.networkFrom - optional - Network to exchange from
   * @param {string} params.coinTo - required - Currency to exchange to
   * @param {string} params.networkTo - optional - Network to exchange to
   * @param {string} params.amount - amount - Amount of currency you are going to send
   * @param {string} params.withdrawalAmount - optional - Amount of currency you are going to get
   * @param {string} params.rateType - required - The type of the coin rate: float - Floating/ fixed - Fixed Default
   * @returns {Promise<{fromAmount: number, toAmount: number, rate: number, minAmount: number}[]>} Promise array of object (code/name/icon/notes)
   */
  async rate(params = {}) {
    if (!('coinFrom' in params)) {
      throw new Error('coinFrom is required param');
    }
    if (!('coinTo' in params)) {
      throw new Error('coinTo is required param');
    }
    if (!('amount' in params)) {
      throw new Error('amount is required param');
    }
    return this.request('GET', '/rate', null, {
      rateType: 'fixed',
      ...params,
    });
  }

  /**
   * Create exchange transaction
   *
   * @param {Object} body - post request body
   * @param {string} body.coinFrom - required - Currency to exchange from
   * @param {string} body.networkFrom - optional - Network to exchange from
   * @param {string} body.coinTo - required - Currency to exchange to
   * @param {string} body.networkTo - optional - Network to exchange to
   * @param {string} body.amount - required - Amount of currency you are going to send
   * @param {string} body.withdrawalAmount - optional - Amount of currency you are going to get
   * @param {string} body.withdrawalAddress - required - Address where the exchange result will be sent to
   * @param {string} body.withdrawalExtraId - optional - Extra ID for withdrawalAddress in case it is required
   * @param {string} body.rateType - required - The type of the coin rate: float - Floating/ fixed - Fixed Default
   * @param {string} body.refundAddress - optional - Address for refund
   * @param {string} body.refundExtraId - optional - Extra ID for refund address
   * @returns {Promise<{Object}>}
   */
  async createTransaction(body = {}) {
    // {
    //   "coinFrom": "ETH",
    //   "coinTo": "USDT",
    //   "networkFrom": "",
    //   "networkTo": "ETH",
    //   "amount": 0.5,
    //   "withdrawalAddress": "0x0E29D1E501f90649Ad5982E900c455006e4522FC",
    //   "withdrawalExtraId": "",
    //   "refundAddress": "0x0070BeBe9E30429437bD9c84C731031c27Fc7955",
    //   "refundExtraId": "",
    //   "rateType": "float"
    // }
    return this.request(
      'POST',
      '/transactions',
      {
        rateType: 'fixed',
        coinFrom: 'coinFrom',
        coinTo: 'coinFrom',
        amount: '0',
        withdrawalAddress: '',
        ...body,
      },
      {},
    );
  }

  /**
   * Get exchange transaction info
   *
   * @param {string} id - Transaction ID from "Create exchange transaction" request
   * @returns {Promise<{Object}>}
   */
  async getById(id) {
    return this.request('GET', `/transactions/${id}`, null, {});
  }
}
