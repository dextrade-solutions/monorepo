import ky from 'ky';

export const $invoiceApi = ky.create({
  prefixUrl: 'https://dexpay-api.dextrade.com',
  headers: {
    'Content-Type': 'application/json',
  },
});
