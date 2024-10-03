import { NetworkNames, formatFundsAmount } from 'dex-helpers';
import { erc20Abi, formatUnits, hexToNumber } from 'viem';
import { useAccount, useBalance, useReadContracts } from 'wagmi';

import { AssetModel } from '../../app/types/p2p-swaps';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

function useAccountBalance(chainId: number | null) {
  const { address } = useAccount();
  const result = useBalance({
    chainId,
    address,
  });
  return result.data?.value;
}

function useErc20Balance(chainId: number | null, contract: string | null) {
  if (!contract) {
    throw new Error('useErc20Balance - no contract provided');
  }
  if (!chainId) {
    throw new Error('useErc20Balance - no asset chain id provided');
  }
  const { address } = useAccount();
  const result = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: contract,
        chainId,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        address: contract,
        chainId,
        abi: erc20Abi,
        functionName: 'decimals',
      },
    ],
  });
  if (result.data) {
    const [balance] = result.data;
    return balance as bigint;
  }
  return null;
}

function useSolanaBalance() {
  const [balance, setBalance] = useState(0n);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    const updateBalance = async () => {
      if (!connection || !publicKey) {
        console.error('Wallet not connected or connection unavailable');
        return;
      }

      try {
        connection.onAccountChange(
          publicKey,
          (updatedAccountInfo) => {
            setBalance(BigInt(updatedAccountInfo.lamports));
          },
          'confirmed',
        );
        const accountInfo = await connection.getAccountInfo(publicKey);

        if (accountInfo) {
          setBalance(BigInt(accountInfo.lamports));
        } else {
          throw new Error('Account info not found');
        }
      } catch (error) {
        console.error('Failed to retrieve account info:', error);
      }
    };

    updateBalance();
  }, [connection, publicKey]);
  return balance;
}

export function getBalanceHook(asset: AssetModel) {
  if (asset.network === NetworkNames.solana) {
    return useSolanaBalance;
  }
  if (asset.contract) {
    return useErc20Balance;
  } else if (!asset.isFiat) {
    return useAccountBalance;
  }
  return () => null;
}

export function useAssetBalance(asset: AssetModel) {
  const useBalanceHook = getBalanceHook(asset);
  const chainId = asset.chainId ? hexToNumber(asset.chainId) : null;
  const result = useBalanceHook(chainId, asset.contract);
  if (typeof result === 'bigint') {
    if (!asset.decimals) {
      throw new Error('useAssetBalance - no decimals provided');
    }
    const value = formatUnits(result, asset.decimals);
    return {
      amount: result,
      value,
      formattedValue: formatFundsAmount(value, asset.symbol),
      inUsdt: asset.priceInUsdt ? asset.priceInUsdt * Number(value) : null,
    };
  }
  return null;
}
