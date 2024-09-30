import {
  ExchangeP2PStatus,
  ExchangePairType,
} from '../../../../shared/constants/exchanger';

// Crypto --> Fiat
// Reserving funds --> Sending coins --> Pending exchanger transfer --> Awaiting confirmation --> Completed|Dispute

// Fiat --> Crypto
// Reserving funds --> Awaiting transfer confirmation —> Pending exchanger transfer --> Completed|Dispute

// Crypto --> Crypto
// Reserving funds --> Sending coins —> Pending exchanger transfer --> Completed|Dispute
export const P2P_STAGES = [
  {
    status: [ExchangeP2PStatus.waitExchangerVerify],
    label: 'Reserving funds',
    pairTypes: [
      ExchangePairType.cryptoCrypto,
      ExchangePairType.cryptoFiat,
      ExchangePairType.fiatCrypto,
      ExchangePairType.fiatFiat,
    ],
  },
  {
    status: [ExchangeP2PStatus.new],
    label: 'Awaiting transfer confirmation',
    pairTypes: [ExchangePairType.fiatCrypto, ExchangePairType.fiatFiat],
  },
  {
    status: [ExchangeP2PStatus.clientTransactionVerify],
    label: 'Sending coins',
    pairTypes: [ExchangePairType.cryptoCrypto, ExchangePairType.cryptoFiat],
  },
  {
    status: [ExchangeP2PStatus.new, ExchangeP2PStatus.waitExchangerTransfer],
    label: 'Pending exchanger transfer',
    pairTypes: [
      ExchangePairType.cryptoCrypto,
      ExchangePairType.cryptoFiat,
      ExchangePairType.fiatCrypto,
      ExchangePairType.fiatFiat,
    ],
  },
  {
    status: [
      ExchangeP2PStatus.verified,
      ExchangeP2PStatus.exchangerTransactionVerify,
    ],
    label: 'Awaiting confirmation',
    pairTypes: [ExchangePairType.cryptoFiat, ExchangePairType.fiatFiat],
  },
  {
    status: [ExchangeP2PStatus.completed],
    label: 'Completed',
    pairTypes: [
      ExchangePairType.cryptoCrypto,
      ExchangePairType.cryptoFiat,
      ExchangePairType.fiatCrypto,
      ExchangePairType.fiatFiat,
    ],
  },
];
