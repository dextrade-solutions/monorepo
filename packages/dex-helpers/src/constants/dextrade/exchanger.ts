export enum ExchangerStatus {
  active = 1,
  deactivated = 0,
}

export enum ExchangerRateSources {
  bestMatch = 'BEST_MATCH',
  binance = 'BINANCE',
  cryptodao = 'CRYPTO_DAO',
  tokenview = 'TOKEN_VIEW',
  coingecko = 'COIN_GECKO',
  swapienwallet = 'SWAPIEN_WALLET',
  cryptocompare = 'CRYPTO_COMPARE',
  coinpaprica = 'COIN_PAPICA',
  coinmarketcup = 'COIN_MARKET_CUP',
  fixedPrice = 'FIXED_PRICE',
}
