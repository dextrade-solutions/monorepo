import { TradeStatus, TradeType } from './trades';
import { Trade } from '../../../types';

// Crypto --> Fiat
// Reserving funds --> Sending coins --> Pending trader transfer --> Awaiting confirmation --> Completed|Dispute

// Fiat --> Crypto
// Reserving funds --> Awaiting transfer confirmation —> Pending trader transfer --> Completed|Dispute

// Crypto --> Crypto
// Reserving funds --> Sending coins —> Pending trader transfer --> Completed|Dispute

export interface P2PStage {
  labelKey: string; // Key for i18n translation
  pairTypes: TradeType[];
  checkStatus: (trade: Trade) => boolean | undefined;
}

export const P2P_STAGES: P2PStage[] = [
  {
    labelKey: 'trade.stage.startingSwap', // Example i18n key
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
    labelKey: 'trade.stage.transferConfirmation', // Example i18n key
    pairTypes: [TradeType.fiatCrypto, TradeType.fiatFiat],
    checkStatus: (trade: Trade) => {
      const statuses = [TradeStatus.new];
      return trade.statusHistory.find((v) => statuses.includes(v.status));
    },
  },
  {
    labelKey: 'trade.stage.clientTransfer', // Example i18n key
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
    labelKey: 'trade.stage.exchangerTransfer', // Example i18n key
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
    labelKey: 'trade.stage.confirmation', // Example i18n key
    pairTypes: [TradeType.cryptoFiat, TradeType.fiatFiat],
    checkStatus: (trade: Trade) => {
      const statuses = [
        TradeStatus.verified,
        TradeStatus.exchangerTransactionVerify,
      ];
      return trade.statusHistory.find((v) => statuses.includes(v.status));
    },
  },
  // {
  //   labelKey: 'trade.stage.completed', // Example i18n key
  //   pairTypes: [
  //     TradeType.atomicSwap,
  //     TradeType.cryptoCrypto,
  //     TradeType.cryptoFiat,
  //     TradeType.fiatCrypto,
  //     TradeType.fiatFiat,
  //   ],
  //   checkStatus: (trade: Trade) => {
  //     return trade.statusHistory.find(
  //       (v) => v.status === TradeStatus.completed,
  //     );
  //   },
  // },
];
