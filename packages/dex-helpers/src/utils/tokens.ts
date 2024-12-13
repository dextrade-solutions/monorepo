import { AssetModel } from '../../types';

export const TOKEN_API_COIN_ICONS = `https://markets.nyc3.digitaloceanspaces.com/coin-icons/`;

const LOCAL_COINS_URLS = {
  aeneas: '/images/coins/aeneas.svg',
  aud: '/images/coins/aud.svg',
  bgn: '/images/coins/bgn.svg',
  brl: '/images/coins/brl.svg',
  cad: '/images/coins/cad.svg',
  chf: '/images/coins/chf.svg',
  czk: '/images/coins/czk.svg',
  dkk: '/images/coins/dkk.svg',
  eur: '/images/coins/eur.svg',
  gpb: '/images/coins/gpb.svg',
  ghs: '/images/coins/ghs.svg',
  hkd: '/images/coins/hkd.svg',
  jpy: '/images/coins/jpy.svg',
  krw: '/images/coins/krw.svg',
  mxn: '/images/coins/mxn.svg',
  ngn: '/images/coins/ngn.svg',
  pln: '/images/coins/pln.svg',
  rub: '/images/coins/rub.svg',
  sek: '/images/coins/sek.svg',
  try: '/images/coins/try.svg',
  usd: '/images/coins/usd.svg',
  vnd: '/images/coins/vnd.svg',
  thb: '/images/coins/thb.svg',
  uah: '/images/coins/uah.svg',
  binance: '/images/coins/binancecoin.png',
  humanode: '/images/coins/humanode.svg',
  philtoken: '/images/coins/phil.svg',
  'cat-in-a-dogs-world': '/images/coins/mew.png',
  matic: '/images/coins/matic.svg',
  ton: '/images/coins/ton.svg',
  base: '/images/coins/base.png',
  'elrond-erd-2': '/images/coins/egld.svg',
  default: '/images/coins/default.svg',
};

export const COIN_DEFAULT = LOCAL_COINS_URLS.default;

export const getCoinIconByUid = (uid: string) => {
  const coinIcon = LOCAL_COINS_URLS[uid];
  if (coinIcon) {
    return coinIcon;
  }
  return `${TOKEN_API_COIN_ICONS}${uid}@3x.png`;
};

export const getAssetKey = (asset: AssetModel) => {
  return `${asset.network}-${asset.symbol}`;
};
