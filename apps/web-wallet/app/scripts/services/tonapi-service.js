import BaseService from './base';

const BASE_URL = 'https://tonapi.io/';

class TonapiServiceApi extends BaseService {
  constructor() {
    super({
      apiBaseUrl: BASE_URL,
    });
  }

  async getTransactions(address, params) {
    const result = await this.publicRequest(
      'GET',
      `/v2/blockchain/accounts/${address}/transactions`,
      null,
      params,
    );
    return result;
  }
}

const Service = new TonapiServiceApi();

export default Service;
