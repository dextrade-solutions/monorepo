import CONTRACT_ADDRESS from '@unizen-io/unizen-contract-addresses/production.json';
import { EContractVersion } from './types';

const CHAIN_KEY_NUMBER: Record<string, number> = {
  ethereum: 1,
  polygon: 137,
  bsc: 56,
  base: 8453,
  optimism: 10,
  arbitrum: 42161,
  fantom: 250,
};

export const UNIZEN_CONTRACT_ADDRESS: {
  [Version in EContractVersion]: {
    [key in string | number]: string;
  };
} = Object.entries(CONTRACT_ADDRESS).reduce(
  (versions, [k, routes]: [string, Record<string | number, string>]) => {
    const numChainsRoutes = Object.entries(routes).reduce(
      (acc, [name, address]) => {
        if (!CHAIN_KEY_NUMBER[name]) {
          return acc;
        }
        return {
          ...acc,
          [name]: address,
          [CHAIN_KEY_NUMBER[name]]: address,
        };
      },
      {} as Record<number, string>,
    );
    return {
      ...versions,
      [k]: numChainsRoutes,
    };
  },
  {},
);
