export const API_BASE_URL = {
  prod: 'https://api.dextrade.com',
  dev: 'https://dev-api.dextrade.com',
  stage: 'https://staging.dextrade.com',
};

export const DEXTRADE_BASE_URL = API_BASE_URL.prod;
export const DEXTRADE_HOST = DEXTRADE_BASE_URL.replace('https://', '');
