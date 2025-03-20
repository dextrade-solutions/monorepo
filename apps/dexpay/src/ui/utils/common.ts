import { getCoinIconByUid } from 'dex-helpers';

import { COINS_UID_BY_TICKER } from '../constants/coins';

export const getCoinIconByIso = (v: string) =>
  getCoinIconByUid(COINS_UID_BY_TICKER[v] || v.toLowerCase());
