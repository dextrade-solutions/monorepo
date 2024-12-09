import axios, { Axios } from 'axios';

const BASE_URL = 'https://gateway.multiversx.com/';

class MultiverseXService {
  axios: Axios;

  constructor() {
    this.axios = axios.create({
      baseURL: BASE_URL,
    });
  }

  getBalance(bech32Address) {
    return this.axios.get(`address/${bech32Address}/balance`);
  }
}

export const multiversxService = new MultiverseXService();
