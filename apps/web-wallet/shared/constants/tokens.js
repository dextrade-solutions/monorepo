import BigNumber from 'bignumber.js';

import {
  testTokens,
  prodTokens,
  // dump,
} from '../../app/overrided-metamask/contract-metadata';
import { testnetModeInitial } from './environment';

const buildInTokens = testnetModeInitial
  ? testTokens.default
  : prodTokens.default;
/**
 * @typedef {object} TokenDetails
 * @property {string} address - The address of the selected 'TOKEN' or
 *  'NFT' contract.
 * @property {string} [symbol] - The symbol of the token.
 * @property {number} [decimals] - The number of decimals of the selected
 *  'ERC20' asset.
 * @property {number} [tokenId] - The id of the selected 'NFT' asset.
 * @property {TokenStandardStrings} [standard] - The standard of the selected
 *  asset.
 * @property {boolean} [isERC721] - True when the asset is a ERC721 token.
 */

export const STATIC_MAINNET_TOKEN_LIST = buildInTokens;

export const TOKEN_API_COIN_ICONS = `https://markets.nyc3.digitaloceanspaces.com/coin-icons/`;

export const TOKEN_API_METASWAP_CODEFI_URL =
  'https://token-api.metaswap.codefi.network/tokens/';
export const MAX_TOKEN_ALLOWANCE_AMOUNT = new BigNumber(2)
  .pow(256)
  .minus(1)
  .toString(10);
// number with optional decimal point using a comma or dot
export const NUM_W_OPT_DECIMAL_COMMA_OR_DOT_REGEX =
  /^[0-9]{1,}([,.][0-9]{1,})?$/u;
export const DECIMAL_REGEX = /\.(\d*)/u;

const LOCAL_COINS_URLS = {
  aeneas: './images/coins/aeneas.svg',
  aud: './images/coins/aud.svg',
  bgn: './images/coins/bgn.svg',
  brl: './images/coins/brl.svg',
  cad: './images/coins/cad.svg',
  chf: './images/coins/chf.svg',
  czk: './images/coins/czk.svg',
  dkk: './images/coins/dkk.svg',
  eur: './images/coins/eur.svg',
  gpb: './images/coins/gpb.svg',
  ghs: './images/coins/ghs.svg',
  hkd: './images/coins/hkd.svg',
  jpy: './images/coins/jpy.svg',
  krw: './images/coins/krw.svg',
  mxn: './images/coins/mxn.svg',
  ngn: './images/coins/ngn.svg',
  pln: './images/coins/pln.svg',
  rub: './images/coins/rub.svg',
  sek: './images/coins/sek.svg',
  try: './images/coins/try.svg',
  usd: './images/coins/usd.svg',
  vnd: './images/coins/vnd.svg',
  thb: './images/coins/thb.svg',
  uah: './images/coins/uah.svg',
  binance: './images/coins/binancecoin.png',
  humanode: './images/coins/humanode.svg',
  default: './images/coins/default.svg',
};

export const COIN_DEFAULT = LOCAL_COINS_URLS.default;

export const getCoinIconByUid = (uid) => {
  const coinIcon = LOCAL_COINS_URLS[uid];
  if (coinIcon) {
    return coinIcon;
  }
  return `${TOKEN_API_COIN_ICONS}${uid}@3x.png`;
};
