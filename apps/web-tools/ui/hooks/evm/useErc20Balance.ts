import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';

export default function useErc20Balance(
  address: `0x${string}`,
  contract: `0x${string}`,
  chainId?: number,
) {
  if (!contract) {
    throw new Error('useErc20Balance - no contract provided');
  }
  if (!chainId) {
    throw new Error('useErc20Balance - no asset chain id provided');
  }
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
