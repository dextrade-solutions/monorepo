import { AuthData } from '../../app/types/auth';
import { DEXTRADE_BASE_URL } from '../../helpers/constants/app';

const AUTHDATA_KEY = 'auth';

export const authdata = (): AuthData =>
  JSON.parse(window.localStorage.getItem(AUTHDATA_KEY) || 'null') || {
    apikey: null,
    apiversion: DEXTRADE_BASE_URL,
    lang: 'en',
  };
