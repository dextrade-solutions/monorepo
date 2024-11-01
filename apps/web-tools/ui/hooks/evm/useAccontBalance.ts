import { useBalance } from 'wagmi';

export default function useAccountBalance(
  address: `0x${string}`,
  chainId?: number,
) {
  const result = useBalance({
    chainId,
    address,
  });
  return result.data?.value;
}
