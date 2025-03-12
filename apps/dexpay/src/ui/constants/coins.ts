export const COINS_UID_BY_TICKER = {
  USDT: 'tether',
  BTC: 'bitcoin',
  PHIL: 'philtoken',
  MEW: 'cat-in-a-dogs-world',
  XDC: 'xdce-crowd-sale',
  LTC: 'litecoin',
  SOL: 'solana',
  EGLD: 'elrond-erd-2',
  ETH: 'ethereum',
};

export const USDT_CURRENCIES = [
  'USDT_BSC',
  'USDT_TRX',
  'USDT_ETH',
  'USDT_SOL',
];

export const MOST_POPULAR_CURRENCIES = [
  'BTC',
  'BSC',
  'TRX',
  'ETH',
  'SOL',
  'USDT_BSC',
  'USDT_TRX',
  'USDT_ETH',
  'USDT_SOL',
];

export enum CurrencyGroupType {
  mostPopular = 1,
  usdt = 2,
}

export const CURRENCIES_ISO_BY_GROUP_TYPE = {
  [CurrencyGroupType.mostPopular]: MOST_POPULAR_CURRENCIES,
  [CurrencyGroupType.usdt]: USDT_CURRENCIES,
};
