import { ExchangeP2PStatus, TradeType } from '../../../../app/constants/p2p';
import { Trade } from '../../../../app/types/p2p-swaps';

// Crypto --> Fiat
// Reserving funds --> Sending coins --> Pending trader transfer --> Awaiting confirmation --> Completed|Dispute

// Fiat --> Crypto
// Reserving funds --> Awaiting transfer confirmation —> Pending trader transfer --> Completed|Dispute

// Crypto --> Crypto
// Reserving funds --> Sending coins —> Pending trader transfer --> Completed|Dispute
export const P2P_STAGES = [
  {
    label: 'Reserving funds',
    pairTypes: [
      TradeType.atomicSwap,
      TradeType.cryptoCrypto,
      TradeType.cryptoFiat,
      TradeType.fiatCrypto,
      TradeType.fiatFiat,
    ],
    checkStatus: (trade: Trade) => {
      const statuses = [ExchangeP2PStatus.waitExchangerVerify];
      return trade.statusHistory.find((v) => statuses.includes(v.status));
    },
  },
  {
    label: 'Transfer confirmation',
    pairTypes: [TradeType.fiatCrypto, TradeType.fiatFiat],
    checkStatus: (trade: Trade) => {
      const statuses = [ExchangeP2PStatus.new];
      return trade.statusHistory.find((v) => statuses.includes(v.status));
    },
  },
  {
    label: 'Client transfer',
    pairTypes: [
      TradeType.atomicSwap,
      TradeType.cryptoCrypto,
      TradeType.cryptoFiat,
    ],
    checkStatus: (trade: Trade) => {
      const statuses = [
        ExchangeP2PStatus.new,
        ExchangeP2PStatus.clientTransactionVerify,
      ];
      return trade.statusHistory.find((v) => statuses.includes(v.status));
    },
  },
  {
    label: 'Exchanger transfer',
    pairTypes: [
      TradeType.atomicSwap,
      TradeType.cryptoCrypto,
      TradeType.cryptoFiat,
      TradeType.fiatCrypto,
      TradeType.fiatFiat,
    ],
    checkStatus: (trade: Trade) => {
      const statuses = [ExchangeP2PStatus.waitExchangerTransfer];
      return trade.statusHistory.find((v) => statuses.includes(v.status));
    },
  },
  {
    label: 'Confirmation',
    pairTypes: [TradeType.cryptoFiat, TradeType.fiatFiat],
    checkStatus: (trade: Trade) => {
      const statuses = [
        ExchangeP2PStatus.verified,
        ExchangeP2PStatus.exchangerTransactionVerify,
      ];
      return trade.statusHistory.find((v) => statuses.includes(v.status));
    },
  },
  {
    label: 'Completed',
    pairTypes: [
      TradeType.atomicSwap,
      TradeType.cryptoCrypto,
      TradeType.cryptoFiat,
      TradeType.fiatCrypto,
      TradeType.fiatFiat,
    ],
    checkStatus: (trade: Trade) => {
      return trade.statusHistory.find(
        (v) => v.status === ExchangeP2PStatus.completed,
      );
    },
  },
];
