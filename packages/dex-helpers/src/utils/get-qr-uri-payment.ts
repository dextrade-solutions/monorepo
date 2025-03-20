function shiftRightPoint(amount: string, decimals: number): string {
  const [integerPart, fractionalPart = ''] = amount.split('.');
  return integerPart + fractionalPart.padEnd(decimals, '0');
}

const CHAIN_IDS = {
  erc20: 1,
  bep20: 56,
  polygon: 137,
  avalanche: 43114,
};

export function getQRuriPayment(
  recipient: string,
  amount: number | string,
  network: string,
  tokenContract: string | null = null,
  decimals: number | null = null,
): string | undefined {
  if (!recipient || !amount) {
    return undefined;
  }
  const lowerCaseNetwork = network.toLowerCase();
  try {
    switch (lowerCaseNetwork) {
      case 'btc':
        return `bitcoin:${recipient}?amount=${amount}`;

      case 'polygon':
      case 'avalanche':
      case 'erc20':
      case 'bep20': {
        const chainId = CHAIN_IDS[lowerCaseNetwork] || 1;
        if (tokenContract) {
          if (decimals === null) {
            return undefined;
          }
          return `ethereum:${tokenContract}@${chainId}/transfer?address=${recipient}&uint256=${shiftRightPoint(amount.toString(), decimals)}`;
        }
        return `ethereum:${recipient}@${chainId}?value=${shiftRightPoint(amount.toString(), 18)}`;
      }

      case 'trc20':
        return tokenContract ? undefined : `tron:${recipient}?amount=${amount}`;

      case 'sol':
        return `solana:${recipient}?amount=${amount}${tokenContract ? `&spl-token=${tokenContract}` : ''}`;

      default:
        return recipient;
    }
  } catch (error) {
    console.error('Error generating QR URI:', error);
    return undefined;
  }
}
