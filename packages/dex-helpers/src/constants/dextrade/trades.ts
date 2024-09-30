export enum TradeStatus {
  waitExchangerVerify = 'WAIT_EXCHANGER_VERIFY',
  new = 'NEW',
  canceled = 'CANCELED',
  clientTransactionVerify = 'CLIENT_TRANSACTION_VERIFY',
  clientTransactionFailed = 'CLIENT_TRANSACTION_FAILED',
  waitExchangerTransfer = 'WAIT_EXCHANGER_TRANSFER',
  exchangerTransactionVerify = 'EXCHANGER_TRANSACTION_VERIFY',
  exchangerTransactionFailed = 'EXCHANGER_TRANSACTION_FAILED',
  verified = 'VERIFIED',
  completed = 'COMPLETED',
  expired = 'EXPIRED',
  dispute = 'DISPUTE',
}

export const TRADE_ACTIVE_STATUSES = [
  TradeStatus.waitExchangerVerify,
  TradeStatus.new,
  TradeStatus.clientTransactionVerify,
  TradeStatus.waitExchangerTransfer,
  TradeStatus.exchangerTransactionVerify,
  TradeStatus.verified,
  TradeStatus.dispute,
];

export enum TradeType {
  cryptoCrypto = 1,
  cryptoFiat = 2,
  fiatCrypto = 3,
  fiatFiat = 4,
  atomicSwap = 5,
}
