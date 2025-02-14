export function getQRCodeURI(
  address: string,
  amount: number | string,
  networkIso: string,
  tokenContract: string | null = null,
): string | undefined {
  if (!address || !amount) {
    return undefined;
  }

  const network = networkIso.toLowerCase();

  if (network === 'btc') {
    return `bitcoin:${address}?amount=${amount}`;
  } else if (network === 'erc20' || network === 'bep20') {
    if (tokenContract) {
      const decimals = network === 'erc20' ? 6 : 18;

      try {
        const amountUint256 = BigInt(
          Math.floor(Number(amount) * 10 ** decimals),
        ).toString();

        return `ethereum:${tokenContract}${network === 'bep20' ? '@56' : '@1'}/transfer?address=${address}&uint256=${amountUint256}`;
      } catch (error) {
        return undefined;
      }
    }

    try {
      const weiAmount = BigInt(Math.floor(Number(amount) * 1e18)).toString();

      return `ethereum:${address}${network === 'bep20' ? '@56' : ''}?value=${weiAmount}`;
    } catch (error) {
      return undefined;
    }
  } else if (network === 'trc20') {
    if (tokenContract) {
      return `tron:${tokenContract}/transfer?recipient=${address}&amount=${amount}`;

      // const scaledAmount = BigInt(Math.floor(Number(amount) * 10 ** decimals)).toString();
      // return `tron:${tokenContract}/transfer?address=${address}&uint256=${scaledAmount}`;
    }
    return `tron:${address}?amount=${amount}`;
  }
  return address;
}
