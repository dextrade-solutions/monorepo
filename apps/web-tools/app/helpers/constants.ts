import { DEXTRADE_BASE_URLS } from 'dex-helpers';

const getUrl = () => {
  const currentMode = import.meta.env.MODE;
  switch (currentMode) {
    case 'development':
      return DEXTRADE_BASE_URLS.dev;
    case 'staging':
      return DEXTRADE_BASE_URLS.stage;
    case 'production':
      return DEXTRADE_BASE_URLS.prod;
    default:
      return DEXTRADE_BASE_URLS.dev;
  }
};

export const DEXTRADE_BASE_URL = getUrl();
export const DEXTRADE_HOST = DEXTRADE_BASE_URL.replace('https://', '');
