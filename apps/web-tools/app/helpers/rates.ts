import axios from 'axios';

export function fetchRates(fromSymbol: string, to: string[]) {
  return axios.get('https://min-api.cryptocompare.com/data/pricemulti', {
    params: { fsyms: [fromSymbol].join(','), tsyms: to.join(',') },
  });
}
