import { AssetModel } from 'dex-helpers/types';
import type { AfterResponseHook } from 'ky';
import { ICurrency } from './types.entities';

export type QueryOptions = {
  afterResponse: AfterResponseHook;
};

export type Theme = 'dark' | 'light';

export type Mode = 'light' | 'advanced';

export interface CurrencyModel extends AssetModel {
  currency: ICurrency;
  balance?: string;
  balanceUsdt?: string;
}
