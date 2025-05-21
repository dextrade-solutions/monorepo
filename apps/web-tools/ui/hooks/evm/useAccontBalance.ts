import { SECOND } from 'dex-helpers';
import { useBalance } from 'wagmi';

export default function useEvmAccountBalance(
  address: `0x${string}`,
  chainId?: number,
  enabled: boolean = true,
) {
  const result = useBalance({
    address,
    chainId,
    query: {
      refetchInterval: 5 * SECOND,
      enabled,
    },
  });

  return result.data?.value;
}
