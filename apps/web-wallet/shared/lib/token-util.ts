import { abiERC20 } from '@metamask/metamask-eth-abis';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { memoize } from 'lodash';

import getFetchWithTimeout from '../modules/fetch-with-timeout';
import { NETWORK_INFO_BY_TOKEN_TYPE } from '../constants/network';
import { STATIC_MAINNET_TOKEN_LIST } from '../constants/tokens';

const fetchWithTimeout = getFetchWithTimeout();

/**
 * Gets the '_value' parameter of the given token transaction data
 * (i.e function call) per the Human Standard Token ABI, if present.
 *
 * @param {object} tokenData - ethers Interface token data.
 * @returns {string | undefined} A decimal string value.
 */
/**
 * Gets either the '_tokenId' parameter or the 'id' param of the passed token transaction data.,
 * These are the parsed tokenId values returned by `parseStandardTokenTransactionData` as defined
 * in the ERC721 and ERC1155 ABIs from metamask-eth-abis (https://github.com/MetaMask/metamask-eth-abis/tree/main/src/abis)
 *
 * @param tokenData - ethers Interface token data.
 * @returns A decimal string value.
 */
export function getTokenIdParam(tokenData: any = {}): string | undefined {
  return (
    tokenData?.args?._tokenId?.toString() ?? tokenData?.args?.id?.toString()
  );
}

// Unique identifier for local tokens. Using for searching
export function getTokenIdLocal({
  chainId,
  contract,
}: {
  chainId: string;
  contract?: string;
}): string {
  const id = [chainId];
  if (contract) {
    id.push(contract);
  }
  return id.join(':');
}

export async function fetchTokenBalance(
  address: string,
  userAddress: string,
  provider: any,
): Promise<any> {
  const ethersProvider = new Web3Provider(provider);
  const tokenContract = new Contract(address, abiERC20, ethersProvider);
  const tokenBalancePromise = tokenContract
    ? tokenContract.balanceOf(userAddress)
    : Promise.resolve();
  return await tokenBalancePromise;
}

export async function fetchTokensRegistry() {
  try {
    const response = await fetchWithTimeout(`./tokens-registry.json`);
    const groupedTokens = await response.json();
    const buildInTokens = STATIC_MAINNET_TOKEN_LIST;
    return Object.assign(
      buildInTokens,
      groupedTokens.reduce((acc, token) => {
        const { platforms } = token;
        const tokens = platforms.reduce(
          (platformsAcc, { address, decimals, type }) => {
            const networkInfo = NETWORK_INFO_BY_TOKEN_TYPE[type.toLowerCase()];
            if (!networkInfo) {
              return platformsAcc;
            }
            const tokenId = getTokenIdLocal({
              chainId: networkInfo.chainId,
              contract: address,
            });
            return {
              ...platformsAcc,
              [tokenId]: {
                localId: tokenId,
                name: token.name,
                symbol: token.code.toUpperCase(),
                decimals,
                uid: token.uid,
                network: networkInfo.network,
                standard: type,
              },
            };
          },
          {},
        );
        return Object.assign(acc, tokens);
      }, {}),
    );
  } catch (error) {
    console.error(
      `failed to fetch tokens-registry.json locale because of ${error}`,
    );
    return {};
  }
}

export const setupTokens = memoize(fetchTokensRegistry);
