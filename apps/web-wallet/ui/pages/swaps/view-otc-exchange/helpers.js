export const normalizeTokenInput = (token, amount) => {
  if (!token) {
    return {};
  }
  const {
    primaryLabel,
    symbol,
    id,
    network: { type, name },
    uid: uuid,
  } = token;

  const coin = {
    id,
    ticker: primaryLabel || symbol,
    networkType: type,
    networkName: {
      value: name,
    },
    networkId: id,
    currencyAggregator: {
      value: type,
    },
    uuid,
  };

  return { token, amount, coin };
};
