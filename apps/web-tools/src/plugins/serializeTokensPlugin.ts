/* eslint-disable import/no-dynamic-require, @typescript-eslint/no-var-requires, no-undef */
// eslint-disable-next-line import/no-nodejs-modules
import { promises as fsPromises } from 'fs';
import _ from 'lodash';

import {
  BUILT_IN_NETWORKS,
  NETWORK_INFO_BY_TOKEN_TYPE,
  NetworkNames,
  NetworkTypes,
} from '../../app/constants/p2p';
import { AssetModel } from '../../app/types/p2p-swaps';

const REGISTRIES = [
  { filename: 'fiats', serializer: transformFiats },
  { filename: 'tokens', serializer: transformTokens },
  {
    filename: 'natives',
    serializer: () => {
      return Object.values(NetworkNames).reduce(
        (acc: AssetModel[], network: string) => {
          const netConfig = BUILT_IN_NETWORKS[network];
          if (netConfig) {
            acc.push({
              chainId: netConfig.id,
              contract: null,
              name: netConfig.name,
              decimals: netConfig.nativeCurrency.decimals,
              symbol: netConfig.nativeCurrency.symbol,
              uid: netConfig.uid,
              network,
              isFiat: false,
              isNative: true,
            });
          }
          return acc;
        },
        [],
      );
    },
  },
];

function transformTokens(filename: string) {
  const assets = require(`./registries/${filename}.json`);
  return assets.reduce((acc, token) => {
    const { platforms } = token;
    const tokens = platforms.reduce(
      (platformsAcc, { address, decimals, type }) => {
        const networkInfo = NETWORK_INFO_BY_TOKEN_TYPE[type.toLowerCase()];
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
          },
        ];
      },
      [] as any[],
    );
    return [...acc, ...tokens];
  }, [] as any[]);
}

function transformFiats(filename: string) {
  const assets = require(`./registries/${filename}.json`);
  return assets.map((fiatTicker: string) => ({
    chainId: null,
    contract: null,
    decimals: null,
    name: fiatTicker,
    symbol: fiatTicker.toUpperCase(),
    uid: fiatTicker.toLowerCase(),
    network: NetworkNames.fiat,
    standard: NetworkTypes.fiat,
    isFiat: true,
    isNative: false,
  }));
}

const serializeTokensPlugin = () => ({
  name: 'serialize-tokens-plugin',
  buildStart() {
    const result = REGISTRIES.map((registry) => {
      return registry.serializer(registry.filename);
    });
    const assetList = JSON.stringify(_.flatMap(result));
    fsPromises.writeFile(`./src/assets-list.json`, assetList);
  },
});

export default serializeTokensPlugin;
