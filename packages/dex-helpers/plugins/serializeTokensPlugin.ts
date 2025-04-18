/* eslint-disable import/no-dynamic-require, @typescript-eslint/no-var-requires, no-undef */
// eslint-disable-next-line import/no-nodejs-modules
import { promises as fsPromises } from 'fs';
import _ from 'lodash';

import {
  BUILT_IN_NETWORKS,
  NETWORK_INFO_BY_TOKEN_TYPE,
  NetworkNames,
} from '../src/constants/dextrade/networks';

interface Token {
  chainId: number | null;
  contract: string | null;
  name: string;
  decimals: number | null;
  symbol: string;
  uid: string;
  network: string | null;
  standard: string | null;
  iso: string;
  isFiat: boolean;
  isNative: boolean;
  weight: number;
}

interface Registry {
  filename: string;
  serializer: (filename: string) => Token[];
}

const REGISTRIES: Registry[] = [
  { filename: 'fiats', serializer: transformFiats },
  { filename: 'tokens-custom', serializer: transformTokens },
  { filename: 'tokens', serializer: transformTokens },
  {
    filename: 'natives',
    serializer: () => {
      return Object.entries(BUILT_IN_NETWORKS).map(([network, netConfig]) => {
        const isMajorNetwork = [
          NetworkNames.bitcoin,
          NetworkNames.ethereum,
          NetworkNames.binance,
        ].includes(network as NetworkNames);

        return {
          chainId: netConfig.id,
          contract: null,
          name: netConfig.name,
          decimals: netConfig.nativeCurrency.decimals,
          symbol: netConfig.nativeCurrency.symbol,
          uid: netConfig.uid,
          network,
          isFiat: false,
          isNative: true,
          weight: isMajorNetwork ? 3 : 1,
          standard: null,
          iso: network === NetworkNames.binance 
            ? `BNB_${netConfig.iso}`
            : netConfig.iso,
        };
      });
    },
  },
];

function transformTokens(filename: string): Token[] {
  const assets = require(`./registries/${filename}.json`);
  return assets.reduce((acc: Token[], token) => {
    const { platforms } = token;
    const tokens = platforms.reduce(
      (platformsAcc: Token[], { address, decimals, type }) => {
        const networkInfo = NETWORK_INFO_BY_TOKEN_TYPE[type.toUpperCase()];
        if (!networkInfo) {
          return platformsAcc;
        }
        return [
          ...platformsAcc,
          {
            chainId: networkInfo.info.id,
            contract: address,
            name: token.name,
            symbol: token.code.toUpperCase(),
            decimals,
            uid: token.uid,
            network: networkInfo.network,
            standard: type,
            isFiat: false,
            isNative: false,
            weight: ['usdt'].includes(token.code) ? 2 : 1,
            iso: `${token.code.toUpperCase()}_${BUILT_IN_NETWORKS[networkInfo.network].iso}`,
          },
        ];
      },
      [],
    );
    return [...acc, ...tokens];
  }, []);
}

function transformFiats(filename: string): Token[] {
  const assets = require(`./registries/${filename}.json`);
  return assets.map((fiatTicker: string) => ({
    chainId: null,
    contract: null,
    decimals: null,
    name: fiatTicker,
    symbol: fiatTicker.toUpperCase(),
    uid: fiatTicker.toLowerCase(),
    network: 'fiat',
    standard: 'fiat',
    isFiat: true,
    isNative: false,
    weight: 0,
    iso: `${fiatTicker.toUpperCase()}`,
  }));
}

const serializeTokensPlugin = () => ({
  name: 'serialize-tokens-plugin',
  buildStart() {
    const result = REGISTRIES.map((registry) => {
      return registry.serializer(registry.filename);
    });
    const assetList = _.flatMap(result)
      .sort((a, b) => a.weight - b.weight)
      .reverse();

    const createAdditionalToken = (name: string, symbol: string, uid: string): Token => ({
      chainId: null,
      contract: null,
      name,
      symbol,
      decimals: null,
      uid,
      network: null,
      standard: null,
      iso: symbol,
      isFiat: false,
      isNative: false,
      weight: 1,
    });

    const additionalTokens: Token[] = [
      {
        chainId: null,
        contract: null,
        name: 'Bitcoin Lightning',
        symbol: BUILT_IN_NETWORKS[NetworkNames.bitcoin].nativeCurrency.symbol,
        decimals: BUILT_IN_NETWORKS[NetworkNames.bitcoin].nativeCurrency.decimals,
        uid: BUILT_IN_NETWORKS[NetworkNames.bitcoin].uid,
        network: NetworkNames.bitcoin,
        standard: 'LIGHTNING',
        iso: 'BTC_LIGHTNING',
        isFiat: false,
        isNative: true,
        weight: 3,
      },
      createAdditionalToken('Tether', 'USDT', 'tether'),
      createAdditionalToken('USD Coin', 'USDC', 'usd-coin'),
      createAdditionalToken('SOAR', 'SOAR', 'soarchain'),
      createAdditionalToken('BNB Binance Coin', 'BNB', 'binancecoin'),
      createAdditionalToken('PHIL', 'PHIL', 'philtoken'),
      createAdditionalToken('MEW', 'MEW', 'cat-in-a-dogs-world'),
      createAdditionalToken('SQR', 'SQR', 'sqr'),
    ];

    const finalAssetList = [...assetList, ...additionalTokens];

    fsPromises.writeFile(`./assets-list.json`, JSON.stringify(finalAssetList));
    fsPromises.writeFile(
      `./assets-dict.json`,
      JSON.stringify(_.keyBy(finalAssetList, 'iso')),
    );
  },
});

export default serializeTokensPlugin;
