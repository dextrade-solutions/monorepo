import { getBalance as wagmiGetBalance, multicall } from '@wagmi/core';
import { getAssetKey, NetworkNames } from 'dex-helpers';
import assetList from 'dex-helpers/assets-list';
import { AssetModel, CoinModel } from 'dex-helpers/types';
import { exchangerService } from 'dex-services';
import { flatMap, groupBy } from 'lodash';
import { useMemo } from 'react';
import { erc20Abi, formatUnits } from 'viem';

import { useAuthWallet } from './useAuthWallet';
import { parseCoinByTickerAndNetwork } from '../../app/helpers/p2p';
import getBalance from '../../app/helpers/tron/get-balance';
import { config } from '../../app/helpers/web3-client-configuration';
import {
  NETOWORK_BY_CONNECTION_TYPE,
  PAYMENT_ASSETS,
} from '../helpers/constants/wallets';

const getAssetBalance = async (asset: AssetModel, address: string) => {
  switch (asset.network) {
    case NetworkNames.tron:
      return getBalance({ address, contract: asset.contract });
    case NetworkNames.ethereum:
    case NetworkNames.binance: {
      const result = await wagmiGetBalance(config, {
        chainId: asset.chainId,
        address: address as `0x${string}`,
      });
      return result.value;
    }
    default:
      throw new Error('No supported asset network found');
  }
};

export default function usePaymodalHandlers() {
  const { wallet } = useAuthWallet();

  const tokens = PAYMENT_ASSETS.filter((asset) =>
    NETOWORK_BY_CONNECTION_TYPE[asset.network].includes(wallet?.connectionType),
  );

  async function fetchBalances(walletAddress: string) {
    const balances: Record<
      string,
      { value: bigint; formatted: string; coin: CoinModel; token: AssetModel }
    > = {};

    const nativePromises: any[] = [];
    const tokenCalls: any[] = [];

    // Iterate through the tokens JSON
    for (const token of tokens) {
      const coin = {
        ticker: token.symbol,
        tokenName: token.name || token.symbol,
        uuid: token.uid,
        networkName: token.network,
        networkType: token.standard,
      } as CoinModel;

      if (token.isNative || !token.chainId) {
        // Fetch Native Token Balance
        nativePromises.push(
          getAssetBalance(token, walletAddress).then((balance) => {
            balances[getAssetKey(token)] = {
              value: balance,
              formatted: formatUnits(balance, token.decimals),
              coin,
              token,
            };
          }),
        );
      } else if (token.contract) {
        // Prepare Multicall for ERC20 Tokens
        tokenCalls.push({
          token,
          coin,
          calldata: {
            address: token.contract as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [walletAddress],
            decimals: token.decimals,
            name: token.name,
          },
        });
      }
    }

    // Execute native balance requests
    await Promise.all(nativePromises);

    const groupedByChainId = groupBy(tokenCalls, (i) => i.token.chainId);
    // Execute ERC20 balances multicall
    await Promise.all(
      Object.entries(groupedByChainId).map(([chainId, contracts]) => {
        const calldata = flatMap(contracts, 'calldata');
        return multicall(config, {
          chainId: Number(chainId),
          contracts: calldata,
        }).then((result) => {
          result.forEach((i, idx) => {
            const { coin, token } = contracts[idx];
            balances[getAssetKey(token)] = {
              value: i.result,
              formatted: formatUnits(i.result, token.decimals),
              coin,
              token,
            };
          });
        });
      }),
    );
    return balances;
  }

  return {
    async updateServerBalances() {
      if (!wallet) {
        throw new Error('handleSyncBalancesWithServer - No wallet');
      }
      const authWalletAddress = await wallet.getCurrentAddress();

      const result = await fetchBalances(authWalletAddress);
      const data = Object.values(result).map((i) => ({
        coin: i.coin,
        reservedAmount: i.formatted,
        walletAddress: authWalletAddress,
      }));
      return exchangerService.createReserve1({ reserves: data });
    },
    async onChooseAsset(params) {
      return wallet.txSend({
        asset: parseCoinByTickerAndNetwork(params.currency, params.networkName),
        amount: params.amount,
        recipient: params.to,
      });
    },
  };
}
