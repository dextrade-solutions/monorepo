import { SECOND } from 'dex-helpers';
import { useBalance } from 'wagmi';

export default function useAccountBalance(
  address: `0x${string}`,
  chainId?: number,
) {
  const result = useBalance({
    address,
    chainId,
    query: {
      refetchInterval: 5 * SECOND,
    },
  });

  return result.data?.value;
}
