import { getBalance, multicall } from '@wagmi/core';
import { getAssetKey, NetworkNames } from 'dex-helpers';
import assetList from 'dex-helpers/assets-list';
import { AssetModel, CoinModel } from 'dex-helpers/types';
import Dexpay from 'dex-plans';
import { exchangerService } from 'dex-services';
import { flatMap, groupBy } from 'lodash';
import { useMemo } from 'react';
import { erc20Abi, formatUnits } from 'viem';
import { useConfig } from 'wagmi';

import { parseCoinByTickerAndNetwork } from '../../../app/helpers/p2p';
import { useAuthWallet } from '../../hooks/useAuthWallet';

export function Plans() {
  const { wallet } = useAuthWallet();
  const authWalletAddress = wallet?.connected.address;
  const config = useConfig();

  const suppportedNetworks = [NetworkNames.binance, NetworkNames.ethereum];
  const tokens = useMemo(() => {
    return assetList.filter(
      (coin) =>
        (coin.isNative && suppportedNetworks.includes(coin.network)) ||
        (coin.symbol === 'USDT' && coin.chainId),
    );
  }, []);

  async function fetchBalances(walletAddress: string) {
    const balances: Record<
      string,
      { value: bigint; formatted: string; coin: CoinModel; token: AssetModel }
    > = {};

    const nativePromises = [];
    const tokenCalls = [];

    // Iterate through the tokens JSON
    for (const token of tokens) {
      const coin = {
        ticker: token.symbol,
        tokenName: token.name || token.symbol,
        uuid: token.uid,
        networkName: token.network,
        networkType: token.standard,
      } as CoinModel;

      if (token.isNative) {
        // Fetch Native Token Balance
        nativePromises.push(
          getBalance(config, {
            chainId: token.chainId,
            address: walletAddress as `0x${string}`,
          }).then((balance) => {
            balances[getAssetKey(token)] = {
              value: balance.value,
              formatted: balance.formatted,
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

  return (
    <Dexpay
      paymodalHandlers={{
        async updateServerBalances() {
          if (!authWalletAddress) {
            throw new Error(
              'handleSyncBalancesWithServer - No authenticated via wallet address',
            );
          }
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
            asset: parseCoinByTickerAndNetwork(
              params.currency,
              params.networkName,
            ),
            amount: params.amount,
            recipient: params.to,
          });
        },
      }}
    />
  );
}
