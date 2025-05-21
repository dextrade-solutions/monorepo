import { SECOND } from 'dex-helpers';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';

export default function useErc20Balance(
  address: `0x${string}`,
  contract: `0x${string}`,
  chainId?: number,
  enabled?: boolean,
) {
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
    query: {
      refetchInterval: 5 * SECOND,
      enabled,
    },
  });
  if (result.data) {
    const [balance] = result.data;
    return balance as bigint;
  }
  return null;
}
