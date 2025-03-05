import BigNumber from 'bignumber.js';

export function getQRuriPayment(
  address: string,
  amount: number | string,
  network: string,
  tokenContract: string | null = null,
): string | undefined {
  if (!address || !amount) {
    return undefined;
  }

  network = network.toLowerCase();

  if (network === 'btc') {
    return `bitcoin:${address}?amount=${amount}`;
  } else if (network === 'erc20' || network === 'bep20') {
    if (tokenContract) {
      const decimals = 18;

      try {
        const amountBN = new BigNumber(amount);
        const decimalsBN = new BigNumber(10).pow(decimals);
        const amountUint256BN = amountBN.multipliedBy(decimalsBN);

        if (
          !amountUint256BN.isFinite() ||
          amountUint256BN.isZero() ||
          amountUint256BN.isNegative()
        ) {
          return undefined;
        }

        const amountUint256 = amountUint256BN.toFixed(0);

        return `ethereum:${tokenContract}${
          network === 'bep20' ? '@56' : '@1'
        }/transfer?address=${address}&uint256=${amountUint256}`;
      } catch (error) {
        return undefined;
      }
    }

    try {
      const amountBN = new BigNumber(amount);
      const weiAmountBN = amountBN.multipliedBy(new BigNumber(10).pow(18));

      if (
        !weiAmountBN.isFinite() ||
        weiAmountBN.isZero() ||
        weiAmountBN.isNegative()
      ) {
        return undefined;
      }
      const weiAmount = weiAmountBN.toFixed(0);

      return `ethereum:${address}${
        network === 'bep20' ? '@56' : ''
      }?value=${weiAmount}`;
    } catch (error) {
      return undefined;
    }
  } else if (network === 'trc20') {
    return `tron:${address}?amount=${amount}`;
  }

  return address;
}
