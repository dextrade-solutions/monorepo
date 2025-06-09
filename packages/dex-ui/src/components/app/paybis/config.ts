import { PaybisConfig } from './paybis-api-client';

const PAYBIS_API_KEY_SANDBOX = 'pk_test';
const PAYBIS_SECRET_KEY_SANDBOX = 'pk_test';
const PAYBIS_WEBHOOK_KEY_SANDBOX = 'wk_test';
const PAYBIS_WEBHOOK_SECRET_SANDBOX = 'wk_secret';

const PAYBIS_API_KEY_PROD = 'pk_prod';
const PAYBIS_SECRET_KEY_PROD = 'pk_prod';
const PAYBIS_WEBHOOK_KEY_PROD = 'wk_test';
const PAYBIS_WEBHOOK_SECRET_PROD = 'wk_secret';

const PAYBIS_API_URL_PROD = 'https://widget-api.paybis.com';
const PAYBIS_API_URL_SANDBOX = 'https://widget-api.sandbox.paybis.com';

const PAYBIS_WIDGET_URL_PROD = 'https://widget.paybis.com';
const PAYBIS_WIDGET_URL_SANDBOX = 'https://widget.sandbox.paybis.com';

const PAYBIS_WIDGETSELL_URL_PROD = 'https://widget.paybis.com';
const PAYBIS_WIDGETSELL_URL_SANDBOX = 'https://widget.sandbox.paybis.com';

const PAYBIS_WEBHOOK_URL =
  'https://dexpay-docs.dextrade.com/services_api/paybis/callback';

const CORS_ORIGIN = 'https://dexpay-docs.dextrade.com';
const API_BASE_URL = 'https://dexpay-docs.dextrade.com/services_api';
const BACK_URL =
  'https://dexpay-docs.dextrade.com/services_front_dev/paybis/back';
const BACK_FAILURE_URL =
  'https://dexpay-docs.dextrade.com/services_front_dev/paybis/back';
const DEPOSITREDIRECT_URL = 'https://ecom.dextrade.com/invoice';

const isProduction = false;

export const config: PaybisConfig = {
  apiKey: isProduction ? PAYBIS_API_KEY_PROD : PAYBIS_API_KEY_SANDBOX,
  secretKey: isProduction ? PAYBIS_SECRET_KEY_PROD : PAYBIS_SECRET_KEY_SANDBOX,
  baseUrl: isProduction ? PAYBIS_API_URL_PROD : PAYBIS_API_URL_SANDBOX,
  widgetUrl: isProduction ? PAYBIS_WIDGET_URL_PROD : PAYBIS_WIDGET_URL_SANDBOX,
  widgetUrlSell: isProduction
    ? PAYBIS_WIDGETSELL_URL_PROD
    : PAYBIS_WIDGETSELL_URL_SANDBOX,
  isLive: isProduction,
  apiUrl: API_BASE_URL,
  backUrl: BACK_URL,
  failureBackUrl: BACK_FAILURE_URL,
  depositRedirectUrl: DEPOSITREDIRECT_URL,
  // locale: 'en',
};

export const ISO_PAYBIS_ID_MAP = {
  ETH: 'ETH-SEPOLIA',
  BNB_BSC: 'BNBSC-TESTNET',
  TRX: 'TRX-SHASTA',
  USDT_TRX: 'USDT-TRC20-SHASTA',
  SHIB_ETH: 'SHIB',
};
