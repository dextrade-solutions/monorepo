import { useBalance } from 'wagmi';

export default function useAccountBalance(
  address: `0x${string}`,
  chainId?: number,
) {
  const result = useBalance({
    address,
    chainId,
  });

  return result.data?.value;
}
