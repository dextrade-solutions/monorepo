import { TradeStatus, TradeType } from './trades';
import { Trade } from '../../../types';

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
      const statuses = [TradeStatus.waitExchangerVerify];
      return trade.statusHistory.find((v) => statuses.includes(v.status));
    },
  },
  {
    label: 'Transfer confirmation',
    pairTypes: [TradeType.fiatCrypto, TradeType.fiatFiat],
    checkStatus: (trade: Trade) => {
      const statuses = [TradeStatus.new];
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
      const statuses = [TradeStatus.new, TradeStatus.clientTransactionVerify];
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
      const statuses = [TradeStatus.waitExchangerTransfer];
      return trade.statusHistory.find((v) => statuses.includes(v.status));
    },
  },
  {
    label: 'Confirmation',
    pairTypes: [TradeType.cryptoFiat, TradeType.fiatFiat],
    checkStatus: (trade: Trade) => {
      const statuses = [
        TradeStatus.verified,
        TradeStatus.exchangerTransactionVerify,
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
        (v) => v.status === TradeStatus.completed,
      );
    },
  },
];
