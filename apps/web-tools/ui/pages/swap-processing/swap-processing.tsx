import { Box } from '@mui/material';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { parseCoin } from '../../../app/helpers/p2p';
import P2PSwapProcessing from '../../components/app/p2p-swap-processing';
import { useTrade } from '../../hooks/useTrade';
// mock
const MOCK_DISPUTE = {
  id: 'b934c2d0-ac3d-438d-a23a-36c1115eb593',
  clientPaymentMethod: {
    userPaymentMethodId: 24,
    paymentMethod: {
      paymentMethodId: 54,
      name: 'SettlePay',
      fields: [
        {
          id: 111,
          name: 'Wallet ID',
          contentType: 'ADDITIONAL_INFO_WITH_TITLE',
          fieldType: 'TEXT_FIELD',
          required: true,
          validate: false,
        },
        {
          id: 112,
          name: 'Wallet Name',
          contentType: 'ADDITIONAL_INFO_WITH_TITLE',
          fieldType: 'TEXT_FIELD',
          required: false,
          validate: false,
        },
      ],
    },
    currency: {
      id: 22,
      iso: 'UAH',
      name: 'Ukrainian hryvnia',
    },
    country: {
      id: 1,
      iso: 'UA',
      name: 'Ukraine',
    },
    data: '{"ADDITIONAL_INFO_WITH_TITLE:111":"3124","ADDITIONAL_INFO_WITH_TITLE:112":"213213123"}',
  },
  exchangerPaymentMethod: {
    userPaymentMethodId: 1,
    paymentMethod: {
      paymentMethodId: 31,
      name: 'PUMB',
      fields: [
        {
          id: 53,
          contentType: 'FULL_NAME',
          fieldType: 'TEXT_FIELD',
          required: true,
          validate: false,
        },
        {
          id: 54,
          contentType: 'IBAN_OR_CARD_NUMBER',
          fieldType: 'TEXT_FIELD',
          required: true,
          validate: false,
        },
        {
          id: 55,
          contentType: 'BANK_NAME',
          fieldType: 'TEXT_FIELD',
          required: false,
          validate: false,
        },
        {
          id: 56,
          contentType: 'ACCOUNT_OPENING_DEPARTMENT',
          fieldType: 'TEXT_FIELD',
          required: false,
          validate: false,
        },
      ],
    },
    currency: {
      id: 8,
      iso: 'EUR',
      name: 'Euro',
    },
    data: '{"FULL_NAME":"Romanenko A","IBAN_OR_CARD_NUMBER":"4111111111111111","BANK_NAME":"","ACCOUNT_OPENING_DEPARTMENT":""}',
  },
  exchangerId: 28,
  exchangerName: 'Exxus',
  exchangerRating: 5,
  exchangerWalletAddress: '0x6F1C4B2bd0489e32AF741C405CcA696E8a95ce9C',
  exchangerWalletAddressInNetwork2: '',
  exchangerTransactionStatus: 'PENDING',
  clientId: 79,
  clientTransactionHash: '0xSCAM',
  clientTransactionStatus: 'SEND',
  clientTransactionCdt: 1718017480177,
  coinPair: {
    price: 601.9,
    priceCoin1InUsdt: 646.3,
    priceCoin2InUsdt: 1.0736,
  },
  amount1: 2,
  amount2: 1203.8,
  priceAdjustment: 0,
  status: 'DISPUTE',
  exchangerSettings: {
    id: 21,
    userId: 28,
    active: true,
    priceAdjustment: 0,
    walletAddress: '0x6F1C4B2bd0489e32AF741C405CcA696E8a95ce9C',
    walletAddressInNetwork2: '',
    coinPair: {
      id: 702,
      pair: 'BNBEUR',
      nameFrom: 'BNB',
      nameTo: 'EUR',
      originalPrice: 601.9,
      price: 601.9,
      priceCoin1InUsdt: 646.3,
      priceCoin2InUsdt: 1.0736,
      currencyAggregator: 'BINANCE',
    },
    from: {
      id: 5,
      ticker: 'BNB',
      tokenName: 'binance coin',
      uuid: 'binancecoin',
      networkType: 'BINANCE',
      networkName: 'binance_smart_chain',
      networkId: 15,
    },
    to: {
      id: 9,
      ticker: 'EUR',
      tokenName: 'eur',
      uuid: 'eur',
      networkType: 'FIAT',
      networkName: 'fiat',
      networkId: 14,
    },
    reserve: {
      id: 16,
      coin: {
        id: 9,
        ticker: 'EUR',
        tokenName: 'eur',
        uuid: 'eur',
        networkType: 'FIAT',
        networkName: 'fiat',
        networkId: 14,
      },
      reserve: 125,
    },
    priceCoin1InCoin2: 0.0016614,
    minimumExchangeAmountCoin1: 0,
    minimumExchangeAmountCoin2: 0,
    paymentMethod: {
      userPaymentMethodId: 1,
      paymentMethod: {
        paymentMethodId: 31,
        name: 'PUMB',
        fields: [
          {
            id: 53,
            contentType: 'FULL_NAME',
            fieldType: 'TEXT_FIELD',
            required: true,
            validate: false,
          },
          {
            id: 54,
            contentType: 'IBAN_OR_CARD_NUMBER',
            fieldType: 'TEXT_FIELD',
            required: true,
            validate: false,
          },
          {
            id: 55,
            contentType: 'BANK_NAME',
            fieldType: 'TEXT_FIELD',
            required: false,
            validate: false,
          },
          {
            id: 56,
            contentType: 'ACCOUNT_OPENING_DEPARTMENT',
            fieldType: 'TEXT_FIELD',
            required: false,
            validate: false,
          },
        ],
      },
      currency: {
        id: 8,
        iso: 'EUR',
        name: 'Euro',
      },
      data: '{"FULL_NAME":"Romanenko A","IBAN_OR_CARD_NUMBER":"4111111111111111","BANK_NAME":"","ACCOUNT_OPENING_DEPARTMENT":""}',
    },
    statistic: {
      transactionCount: 2,
      amountInCoinFrom: 0,
      amountInCoinTo: 0,
    },
    canUpdate: false,
    slippage: 0.1,
    lastActive: 1718017503085,
    cdt: 1718013444689,
  },
  statusHistory: [
    {
      id: 121,
      exchangeId: 'b934c2d0-ac3d-438d-a23a-36c1115eb593',
      status: 'WAIT_EXCHANGER_VERIFY',
      cdt: 1718017464454,
    },
    {
      id: 122,
      exchangeId: 'b934c2d0-ac3d-438d-a23a-36c1115eb593',
      status: 'NEW',
      cdt: 1718017473167,
    },
    {
      id: 123,
      exchangeId: 'b934c2d0-ac3d-438d-a23a-36c1115eb593',
      status: 'CLIENT_TRANSACTION_VERIFY',
      cdt: 1718017480178,
    },
    {
      id: 124,
      exchangeId: 'b934c2d0-ac3d-438d-a23a-36c1115eb593',
      status: 'WAIT_EXCHANGER_TRANSFER',
      cdt: 1718017480325,
    },
    {
      id: 125,
      exchangeId: 'b934c2d0-ac3d-438d-a23a-36c1115eb593',
      status: 'DISPUTE',
      cdt: 1718017496688,
    },
  ],
  cdt: 1718017464454,
  clientSessionId: {
    id: 80,
    userId: 79,
    sessionId:
      '0283ad10a00badb88d035bec4a43c6617bf63347f1097725dd89ffdffe831a91d6',
    deviceId:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    lastActive: 1718012158397,
    created: 1718012032160,
    status: 'ACTIVE',
  },
  exchangerSessionId: {
    id: 5,
    userId: 28,
    sessionId:
      '0290972ae402e65a03c5c23b28911b36e7398665b71a69f74e8904f886c47ce744',
    deviceId: 'aa5f280933352424',
    lastActive: 1718017503085,
    created: 1717570697933,
    status: 'ACTIVE',
  },
  exchangerConfirmedAmount: 1203.8,
};
const MOCK = {
  id: 'b19fc1a2-ccf6-4a7b-b724-f339932cf257',
  clientPaymentMethod: {
    userPaymentMethodId: 51,
    paymentMethod: {
      paymentMethodId: 54,
      name: 'SettlePay',
      fields: [
        {
          id: 111,
          name: 'Wallet ID',
          contentType: 'ADDITIONAL_INFO_WITH_TITLE',
          fieldType: 'TEXT_FIELD',
          required: true,
          validate: false,
        },
        {
          id: 112,
          name: 'Wallet Name',
          contentType: 'ADDITIONAL_INFO_WITH_TITLE',
          fieldType: 'TEXT_FIELD',
          required: false,
          validate: false,
        },
      ],
    },
    currency: {
      id: 8,
      iso: 'EUR',
      name: 'Euro',
    },
    data: '{"ADDITIONAL_INFO_WITH_TITLE:111":"1","ADDITIONAL_INFO_WITH_TITLE:112":"1"}',
  },
  exchangerPaymentMethod: {
    userPaymentMethodId: 2,
    paymentMethod: {
      paymentMethodId: 42,
      name: 'KredoBank',
      fields: [
        {
          id: 82,
          contentType: 'FULL_NAME',
          fieldType: 'TEXT_FIELD',
          required: true,
          validate: false,
        },
        {
          id: 83,
          contentType: 'IBAN',
          fieldType: 'TEXT_FIELD',
          required: true,
          validate: false,
        },
        {
          id: 84,
          contentType: 'ADDITIONAL_INFO',
          fieldType: 'TEXT_FIELD',
          required: false,
          validate: false,
        },
      ],
    },
    currency: {
      id: 8,
      iso: 'EUR',
      name: 'Euro',
    },
    data: '{"FULL_NAME":"Pixel","IBAN":"41111111111111111111","ADDITIONAL_INFO":""}',
  },
  exchangerId: 14,
  exchangerName: 'Pixeldev',
  exchangerRating: 5,
  exchangerWalletAddress: '0xF38986d8c3269E5D9a09496d67ed07137Bb936f8',
  exchangerWalletAddressInNetwork2: '',
  exchangerSentAmount: 491.93,
  exchangerTransactionStatus: 'SEND',
  exchangerTransactionCdt: 1717140919907,
  clientId: 192,
  clientTransactionHash: '0xSCAM',
  clientTransactionStatus: 'SEND',
  clientTransactionCdt: 1717140861287,
  coinPair: {
    price: 492.03,
    priceCoin1InUsdt: 590.9,
    priceCoin2InUsdt: 1.0804,
  },
  amount1: 1,
  amount2: 492.03,
  priceAdjustment: -10,
  transactionFee: 0.1,
  status: 'COMPLETED',
  exchangerSettings: {
    id: 16,
    userId: 14,
    active: true,
    priceAdjustment: -10,
    transactionFee: 0.1,
    walletAddress: '0xF38986d8c3269E5D9a09496d67ed07137Bb936f8',
    walletAddressInNetwork2: '',
    coinPair: {
      id: 702,
      pair: 'BNBEUR',
      nameFrom: 'BNB',
      nameTo: 'EUR',
      originalPrice: 546.7,
      price: 492.03,
      priceCoin1InUsdt: 590.9,
      priceCoin2InUsdt: 1.0804,
      currencyAggregator: 'BINANCE',
    },
    from: {
      id: 3,
      ticker: 'BNB',
      tokenName: 'binance coin',
      uuid: 'binancecoin',
      networkType: 'BINANCE',
      networkName: 'binance_smart_chain',
      networkId: 15,
    },
    to: {
      id: 9,
      ticker: 'EUR',
      tokenName: 'eur',
      uuid: 'eur',
      networkType: 'FIAT',
      networkName: 'fiat',
      networkId: 14,
    },
    reserve: {
      id: 29,
      coin: {
        id: 9,
        ticker: 'EUR',
        tokenName: 'eur',
        uuid: 'eur',
        networkType: 'FIAT',
        networkName: 'fiat',
        networkId: 14,
      },
      reserve: 5550,
      reservedAmount: 492.13,
    },
    priceCoin1InCoin2: 0.00203239,
    minimumExchangeAmountCoin1: 0,
    minimumExchangeAmountCoin2: 0,
    exchangersPolicy: 'fight\nbuffet\n',
    paymentMethod: {
      userPaymentMethodId: 2,
      paymentMethod: {
        paymentMethodId: 42,
        name: 'KredoBank',
        fields: [
          {
            id: 82,
            contentType: 'FULL_NAME',
            fieldType: 'TEXT_FIELD',
            required: true,
            validate: false,
          },
          {
            id: 83,
            contentType: 'IBAN',
            fieldType: 'TEXT_FIELD',
            required: true,
            validate: false,
          },
          {
            id: 84,
            contentType: 'ADDITIONAL_INFO',
            fieldType: 'TEXT_FIELD',
            required: false,
            validate: false,
          },
        ],
      },
      currency: {
        id: 8,
        iso: 'EUR',
        name: 'Euro',
      },
      data: '{"FULL_NAME":"Pixel","IBAN":"41111111111111111111","ADDITIONAL_INFO":""}',
    },
    statistic: {
      transactionCount: 2,
      amountInCoinFrom: -49.213,
      amountInCoinTo: -0.09001829156758734,
    },
    canUpdate: true,
    slippage: 10,
    cdt: 1716980651160,
  },
  statusHistory: [
    {
      id: 353,
      exchangeId: 'b19fc1a2-ccf6-4a7b-b724-f339932cf257',
      status: 'WAIT_EXCHANGER_VERIFY',
      cdt: 1717140813015,
    },
    {
      id: 354,
      exchangeId: 'b19fc1a2-ccf6-4a7b-b724-f339932cf257',
      status: 'NEW',
      cdt: 1717140852594,
    },
    {
      id: 355,
      exchangeId: 'b19fc1a2-ccf6-4a7b-b724-f339932cf257',
      status: 'CLIENT_TRANSACTION_VERIFY',
      cdt: 1717140861288,
    },
    {
      id: 356,
      exchangeId: 'b19fc1a2-ccf6-4a7b-b724-f339932cf257',
      status: 'WAIT_EXCHANGER_TRANSFER',
      cdt: 1717140861319,
    },
    {
      id: 357,
      exchangeId: 'b19fc1a2-ccf6-4a7b-b724-f339932cf257',
      status: 'EXCHANGER_TRANSACTION_VERIFY',
      cdt: 1717140919936,
    },
    {
      id: 358,
      exchangeId: 'b19fc1a2-ccf6-4a7b-b724-f339932cf257',
      status: 'COMPLETED',
      cdt: 1717140974645,
    },
  ],
  cdt: 1717140813014,
  clientSessionId: {
    id: 298,
    userId: 192,
    sessionId:
      '0x02927ced16fe280906042f841d004fa4961ddbb708659a3c5cb051a9d52afba1bd',
    deviceId:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    lastActive: 1717140771556,
    created: 1717140771556,
    status: 'ACTIVE',
  },
  exchangerSessionId: {
    id: 205,
    userId: 14,
    sessionId:
      '03c85622d979097b1f344fd85fa5a50a34899656cbefdf5ef81aef2d268405b0eb',
    deviceId: '581f34b1e218cac4',
    lastActive: 1717141190962,
    created: 1716463881887,
    status: 'ACTIVE',
  },
  exchangerConfirmedAmount: 491.93,
};

export const SwapProcessing = () => {
  const { id } = useParams();

  const { isLoading, trade } = useTrade(id);

  const fromAsset = useMemo(
    () =>
      trade &&
      parseCoin(
        trade.exchangerSettings.from,
        trade.exchangerSettings.coinPair.priceCoin1InUsdt,
      ),
    [trade],
  );
  const toAsset = useMemo(
    () =>
      trade &&
      parseCoin(
        trade.exchangerSettings.to,
        trade.exchangerSettings.coinPair.priceCoin2InUsdt,
      ),
    [trade],
  );

  if (trade && fromAsset && toAsset) {
    return <P2PSwapProcessing exchange={trade} from={fromAsset} to={toAsset} />;
  }

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (!trade) {
    return <Box>Trade with id {id} was not found</Box>;
  }

  if (!fromAsset) {
    return (
      <Box>Coin {trade.exchangerSettings.from.ticker} is not supported</Box>
    );
  } else if (!toAsset) {
    return <Box>Coin {trade.exchangerSettings.to.ticker} is not supported</Box>;
  }

  return null;
};
