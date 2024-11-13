/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ZealyAccountsModel {
  email?: string;
  wallet?: string;
  discord?: ZealyDiscordModel;
  twitter?: ZealyTwitterModel;
  "zealy-connect"?: string;
}

export interface ZealyAuthRequestModel {
  userId?: string;
  communityId?: string;
  subdomain?: string;
  questId?: string;
  requestId?: string;
  accounts?: ZealyAccountsModel;
}

export interface ZealyDiscordModel {
  id?: string;
  handle?: string;
}

export interface ZealyTwitterModel {
  id?: string;
  username?: string;
}

export interface UtilsUTXORequestModel {
  address?: string;
  currency?: "ETH" | "BNB" | "TRX" | "BTC" | "USDT";
  sortedValuesByKeyAsString?: string;
}

export interface UtilsUTXODataModel {
  txid?: string;
  /** @format int64 */
  vout?: number;
  amount?: number;
}

export interface UtilsUTXOResponseModel {
  data?: UtilsUTXODataModel[];
}

export interface ProviderExchangerSettingsStatusRequestModel {
  projectName?: string;
  /** @format int64 */
  exchangerSettingsId?: number;
  status?: boolean;
  /** @format int64 */
  userId?: number;
}

export interface CoinCreateModel {
  ticker?: string;
  tokenName?: string;
  uuid?: string;
  networkType?: string;
  networkName?:
    | "ethereum"
    | "tron"
    | "the_open_network"
    | "binance_smart_chain"
    | "binance_chain"
    | "polygon"
    | "optimism"
    | "gnosis"
    | "fantom"
    | "avalanche"
    | "solana"
    | "bitcoin"
    | "elrond"
    | "litecoin"
    | "dash"
    | "dogecoin"
    | "zcash"
    | "ecash"
    | "bitcoin_cash"
    | "fiat"
    | "arbitrumOne"
    | "xdc_network";
}

export interface CoinPairsCreateModel {
  currencyAggregator?: "BINANCE" | "CRYPTO_COMPARE" | "COIN_MARKET_CUP" | "DEXPAY" | "COIN_GECKO" | "FIXED_PRICE";
  price?: number;
}

export interface ProviderOptionalExchangerSettingsModel {
  minimumExchangeAmountCoin1?: number;
  maximumExchangeAmountCoin1?: number;
  priceAdjustment?: number;
  transactionFee?: number;
  active?: boolean;
  /** @format double */
  amlRiskLimit?: number;
  /** @format double */
  slippage?: number;
  reserveLimitation?: number;
  /** @format int64 */
  timeToPay?: number;
  tradeWithKycUsers?: boolean;
}

export interface ProviderUserExchangerSettingsUpdateModel {
  projectName?: string;
  /** @format int64 */
  exchangerSettingsId?: number;
  /** @format int64 */
  userId?: number;
  provider?: "DEXTRADE" | "EXOLIX" | "PANCAKE" | "UNISWAP" | "DEXPAY";
  fromCoin?: CoinCreateModel;
  toCoin?: CoinCreateModel;
  coinPair?: CoinPairsCreateModel;
  exchangersPolicy?: string;
  optionalSettings?: ProviderOptionalExchangerSettingsModel;
}

export interface ProviderExchangerSettingsResponseModel {
  /** @format int64 */
  exchangerSettingsId?: number;
  /** @format int64 */
  reversedExchangerSettingsId?: number;
}

export interface ProviderExchangerSettingsListRequestModel {
  projectName?: string;
  /** @format int64 */
  userId?: number;
}

export interface BankDictModel {
  /** @format int64 */
  paymentMethodId?: number;
  name?: string;
  description?: string;
  fields?: BankFieldsInfoModel[];
}

export interface BankFieldsInfoModel {
  /** @format int64 */
  id?: number;
  name?: string;
  contentType?:
    | "ADDITIONAL_INFO"
    | "ADDITIONAL_INFO_WITH_TITLE"
    | "CARD_NUMBER"
    | "IBAN"
    | "BAN"
    | "IBAN_OR_CARD_NUMBER"
    | "EMAIL"
    | "NUMBER_ONLY"
    | "IMAGE_QR"
    | "LAST_4_DIGITS"
    | "PHONE"
    | "USERNAME"
    | "FULL_NAME"
    | "BANK_NAME"
    | "ACCOUNT_OPENING_DEPARTMENT";
  fieldType?: "TEXT_AREA" | "TEXT_FIELD" | "IMAGE";
  required?: boolean;
  validate?: boolean;
}

export interface CoinModel {
  /** @format int64 */
  id?: number;
  ticker?: string;
  tokenName?: string;
  uuid?: string;
  networkType?: string;
  networkName?:
    | "ethereum"
    | "tron"
    | "the_open_network"
    | "binance_smart_chain"
    | "binance_chain"
    | "polygon"
    | "optimism"
    | "gnosis"
    | "fantom"
    | "avalanche"
    | "solana"
    | "bitcoin"
    | "elrond"
    | "litecoin"
    | "dash"
    | "dogecoin"
    | "zcash"
    | "ecash"
    | "bitcoin_cash"
    | "fiat"
    | "arbitrumOne"
    | "xdc_network";
  /** @format int64 */
  networkId?: number;
}

export interface CoinPairsModel {
  /** @format int64 */
  id?: number;
  pair?: string;
  idFrom?: string;
  idTo?: string;
  nameFrom?: string;
  nameTo?: string;
  originalPrice?: number;
  price?: number;
  priceCoin1InUsdt?: number;
  priceCoin2InUsdt?: number;
  currencyAggregator?: "BINANCE" | "CRYPTO_COMPARE" | "COIN_MARKET_CUP" | "DEXPAY" | "COIN_GECKO" | "FIXED_PRICE";
  flipped?: boolean;
  /** @format int64 */
  parentId?: number;
  /** @format int64 */
  userId?: number;
}

export interface CountryDictModel {
  /** @format int64 */
  id?: number;
  iso?: string;
  name?: string;
}

export interface ExchangerSettingsInfoModel {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  userId?: number;
  active?: boolean;
  priceAdjustment?: number;
  transactionFee?: number;
  walletAddress?: string;
  walletAddressInNetwork2?: string;
  coinPair?: CoinPairsModel;
  from?: CoinModel;
  to?: CoinModel;
  reserve?: ReserveModel[];
  reserveSum?: number;
  priceCoin1InCoin2?: number;
  minimumExchangeAmountCoin1?: number;
  minimumExchangeAmountCoin2?: number;
  maximumExchangeAmountCoin1?: number;
  maximumExchangeAmountCoin2?: number;
  reserveLimitation?: number;
  /** @format int64 */
  timeToPay?: number;
  exchangersPolicy?: string;
  paymentMethods?: PaymentMethodsModel[];
  statistic?: StatisticModel;
  isAtomicSwap?: boolean;
  /** @format int64 */
  timeToRefund?: number;
  /** @format double */
  slippage?: number;
  /** @format int64 */
  lastActive?: number;
  /** @format double */
  amlRiskLimit?: number;
  officialMerchant?: boolean;
  tradeWithKycUsers?: boolean;
  provider?: "DEXTRADE" | "EXOLIX" | "PANCAKE" | "UNISWAP" | "DEXPAY";
  /** @format int64 */
  cdt?: number;
}

export interface PaymentMethodCurrencyModel {
  /** @format int64 */
  id?: number;
  iso?: string;
  name?: string;
}

export interface PaymentMethodsModel {
  /** @format int64 */
  userPaymentMethodId?: number;
  paymentMethod?: BankDictModel;
  currency?: PaymentMethodCurrencyModel;
  country?: CountryDictModel;
  balance?: number;
  balanceIsRequired?: boolean;
  /** @format int64 */
  userId?: number;
  data?: string;
}

export interface ReserveModel {
  /** @format int64 */
  id?: number;
  coin?: CoinModel;
  reserveInCoin1?: number;
  reserveInCoin2?: number;
  reservedAmount?: number;
  walletAddress?: string;
  /** @format int64 */
  userId?: number;
}

export interface StatisticModel {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  userId?: number;
  /** @format int64 */
  transactionCount?: number;
  amountInCoinFrom?: number;
  amountInCoinTo?: number;
  amountInUsdt?: number;
  amountInBTC?: number;
  amountInETH?: number;
  /** @format uuid */
  exchangeId?: string;
  /** @format date-time */
  cdt?: string;
}

export interface ProviderUserCreateModel {
  projectName?: string;
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ProviderUserResponseModel {
  /** @format int64 */
  userId?: number;
}

export interface ProviderUserExchangerSettingsCreateModel {
  projectName?: string;
  /** @format int64 */
  userId?: number;
  provider?: "DEXTRADE" | "EXOLIX" | "PANCAKE" | "UNISWAP" | "DEXPAY";
  fromCoin?: CoinCreateModel;
  toCoin?: CoinCreateModel;
  coinPair?: CoinPairsCreateModel;
  createReversedPair?: boolean;
  exchangersPolicy?: string;
  optionalSettings?: ProviderOptionalExchangerSettingsModel;
  reversedOptionalSettings?: ProviderOptionalExchangerSettingsModel;
}

export interface PriceResponseModel {
  /** @format int64 */
  last_updated?: number;
  /** @format int64 */
  price_change_24h?: number;
  price?: number;
  uid?: string;
}

export interface PaymentCallBackModel {
  event_type?: string;
  payload?: PaymentPayloadModel[];
}

export interface PaymentCurrencyModel {
  iso?: string;
}

export interface PaymentPayloadModel {
  /** @format int64 */
  id?: number;
  amount?: string;
  txid?: string;
  type?: string;
  from_address?: string;
  to_address?: string;
  /** @format int32 */
  confirmations?: number;
  /** @format int32 */
  blockchain_status?: number;
  /** @format int32 */
  status?: number;
  network_fee?: string;
  user?: PaymentPayloadUserModel;
  currency?: PaymentCurrencyModel;
}

export interface PaymentPayloadUserModel {
  /** @format int64 */
  id?: number;
  external_id?: string;
  /** @format int64 */
  project_id?: number;
  /** @format int64 */
  status?: number;
}

export interface ExchangeModel {
  /** @format uuid */
  id?: string;
  isExchanger?: boolean;
  isClient?: boolean;
  clientPaymentMethod?: PaymentMethodsModel;
  exchangerPaymentMethod?: PaymentMethodsModel;
  /** @format int64 */
  exchangerId?: number;
  exchangerName?: string;
  exchangerWalletAddress?: string;
  exchangerWalletAddressInNetwork2?: string;
  exchangerSentAmount?: number;
  exchangerFee?: number;
  exchangerTransactionHash?: string;
  exchangerTransactionStatus?: "PENDING" | "FAILED" | "SEND" | "CONFIRMED" | "IN_PROGRESS";
  /** @format int64 */
  exchangerTransactionCdt?: number;
  /** @format int64 */
  clientId?: number;
  clientWalletAddress?: string;
  clientSentFromAddress?: string;
  clientSentAmount?: number;
  clientTransactionHash?: string;
  clientTransactionStatus?: "PENDING" | "FAILED" | "SEND" | "CONFIRMED" | "IN_PROGRESS";
  /** @format int64 */
  clientTransactionCdt?: number;
  coinPair?: CoinPairsModel;
  amount1?: number;
  amount2?: number;
  priceAdjustment?: number;
  transactionFee?: number;
  status?:
    | "WAIT_EXCHANGER_VERIFY"
    | "NEW"
    | "EXPIRED"
    | "CLIENT_TRANSACTION_FAILED"
    | "EXCHANGER_TRANSACTION_FAILED"
    | "CLIENT_TRANSACTION_VERIFY"
    | "EXCHANGER_TRANSACTION_VERIFY"
    | "WAIT_EXCHANGER_TRANSFER"
    | "VERIFIED"
    | "COMPLETED"
    | "CANCELED"
    | "DISPUTE";
  fromTicker?: string;
  fromNetworkType?: string;
  toTicker?: string;
  toNetworkType?: string;
  fromAggregator?: "BINANCE" | "CRYPTO_COMPARE" | "COIN_MARKET_CUP" | "DEXPAY" | "COIN_GECKO" | "FIXED_PRICE";
  toAggregator?: "BINANCE" | "CRYPTO_COMPARE" | "COIN_MARKET_CUP" | "DEXPAY" | "COIN_GECKO" | "FIXED_PRICE";
  exchangerBlockChain?:
    | "ethereum"
    | "tron"
    | "the_open_network"
    | "binance_smart_chain"
    | "binance_chain"
    | "polygon"
    | "optimism"
    | "gnosis"
    | "fantom"
    | "avalanche"
    | "solana"
    | "bitcoin"
    | "elrond"
    | "litecoin"
    | "dash"
    | "dogecoin"
    | "zcash"
    | "ecash"
    | "bitcoin_cash"
    | "fiat"
    | "arbitrumOne"
    | "xdc_network";
  clientBlockChain?:
    | "ethereum"
    | "tron"
    | "the_open_network"
    | "binance_smart_chain"
    | "binance_chain"
    | "polygon"
    | "optimism"
    | "gnosis"
    | "fantom"
    | "avalanche"
    | "solana"
    | "bitcoin"
    | "elrond"
    | "litecoin"
    | "dash"
    | "dogecoin"
    | "zcash"
    | "ecash"
    | "bitcoin_cash"
    | "fiat"
    | "arbitrumOne"
    | "xdc_network";
  exchangerSettings?: ExchangerSettingsInfoModel;
  statistic?: StatisticModel;
  statusHistory?: StatusHistoryModel[];
  /** @format int64 */
  cdt?: number;
  clientSessionId?: UserSessionModel;
  exchangerSessionId?: UserSessionModel;
  /** @format double */
  clientSlippage?: number;
  exchangerConfirmedAmount?: number;
  clientRating?: RatingModel;
  exchangerRating?: RatingModel;
  /** @format int64 */
  unread?: number;
  clientParams?: string;
  exchangerParams?: string;
  /** @format double */
  clientTransactionRiskScore?: number;
  /** @format double */
  clientSentFromAddressRiskScore?: number;
  clientSafe?: SafeModel;
  exchangerSafe?: SafeModel;
  provider?: "DEXTRADE" | "EXOLIX" | "PANCAKE" | "UNISWAP" | "DEXPAY";
}

export interface RatingModel {
  positive?: boolean;
  feedback?: string;
  /** @format int64 */
  cdt?: number;
}

export interface SafeModel {
  transactionHash?: string;
  address?: string;
  amount?: number;
  /** @format int32 */
  vout?: number;
}

export interface StatusHistoryModel {
  /** @format int64 */
  id?: number;
  /** @format uuid */
  exchangeId?: string;
  status?:
    | "WAIT_EXCHANGER_VERIFY"
    | "NEW"
    | "EXPIRED"
    | "CLIENT_TRANSACTION_FAILED"
    | "EXCHANGER_TRANSACTION_FAILED"
    | "CLIENT_TRANSACTION_VERIFY"
    | "EXCHANGER_TRANSACTION_VERIFY"
    | "WAIT_EXCHANGER_TRANSFER"
    | "VERIFIED"
    | "COMPLETED"
    | "CANCELED"
    | "DISPUTE";
  /** @format int64 */
  cdt?: number;
}

export interface UserSessionModel {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  userId?: number;
  sessionId?: string;
  name?: string;
  deviceId?: string;
  apiKey?: string;
  /** @format int64 */
  lastActive?: number;
  /** @format int64 */
  created?: number;
  status?: "ACTIVE" | "OFFLINE";
}

export interface ExchangerFilterModel {
  fromTicker?: string;
  fromNetworkType?: string;
  fromNetworkName?:
    | "ethereum"
    | "tron"
    | "the_open_network"
    | "binance_smart_chain"
    | "binance_chain"
    | "polygon"
    | "optimism"
    | "gnosis"
    | "fantom"
    | "avalanche"
    | "solana"
    | "bitcoin"
    | "elrond"
    | "litecoin"
    | "dash"
    | "dogecoin"
    | "zcash"
    | "ecash"
    | "bitcoin_cash"
    | "fiat"
    | "arbitrumOne"
    | "xdc_network";
  orderBy?: "BY_PRICE" | "BY_RATING" | "BY_RESERVE";
  toTicker?: string;
  toNetworkType?: string;
  toNetworkName?:
    | "ethereum"
    | "tron"
    | "the_open_network"
    | "binance_smart_chain"
    | "binance_chain"
    | "polygon"
    | "optimism"
    | "gnosis"
    | "fantom"
    | "avalanche"
    | "solana"
    | "bitcoin"
    | "elrond"
    | "litecoin"
    | "dash"
    | "dogecoin"
    | "zcash"
    | "ecash"
    | "bitcoin_cash"
    | "fiat"
    | "arbitrumOne"
    | "xdc_network";
  amountInCoin1?: number;
  /** @format int32 */
  rating?: number;
  /** @format int64 */
  userId?: number;
  /** @format int64 */
  searchUserId?: number;
  notSupportedCoins?: string[];
  name?: string;
  /** @format int64 */
  page?: number;
  /** @format int64 */
  size?: number;
}

export interface ExchangerModel {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  coinId?: number;
  /** @format int64 */
  coinFromId?: number;
  /** @format int64 */
  timeToPay?: number;
  reserveLimitation?: number;
  paymentMethods?: PaymentMethodsModel[];
  priceInCoin2?: number;
  reserve?: ReserveModel[];
  reserveSum?: number;
  feeInCoin1?: number;
  transactionFee?: number;
  priceAdjustment?: number;
  minimumExchangeAmountCoin1?: number;
  minimumExchangeAmountCoin2?: number;
  maximumExchangeAmountCoin1?: number;
  maximumExchangeAmountCoin2?: number;
  avatar?: string;
  name?: string;
  walletAddress?: string;
  walletAddressInNetwork2?: string;
  rating?: TotalRatingResponseModel;
  feedbacks?: UserRatingInfoModel[];
  /** @format int32 */
  exchangeCount?: number;
  /** @format double */
  exchangeCompletionRate?: number;
  /** @format int32 */
  exchangeMonthlyCount?: number;
  /** @format double */
  exchangeMonthlyCompletionRate?: number;
  fromCoin?: CoinModel;
  toCoin?: CoinModel;
  /** @format int64 */
  lastActive?: number;
  currentUserExchanger?: boolean;
  /** @format int64 */
  userId?: number;
  coinPair?: CoinPairsModel;
  exchangersPolicy?: string;
  isAtomicSwap?: boolean;
  /** @format int64 */
  timeToRefund?: number;
  isKycVerified?: boolean;
  /** @format double */
  amlRiskLimit?: number;
  /** @format int32 */
  daysSinceRegistration?: number;
  /** @format int32 */
  daysSinceFirstExchange?: number;
  /** @format int32 */
  counterpartiesCount?: number;
  provider?: "DEXTRADE" | "EXOLIX" | "PANCAKE" | "UNISWAP" | "DEXPAY";
  officialMerchant?: boolean;
  hasReversed?: boolean;
  exchangerActive?: boolean;
}

export interface TotalRatingResponseModel {
  /** @format int64 */
  positive?: number;
  /** @format int64 */
  negative?: number;
  /** @format double */
  totalRating?: number;
}

export interface UserRatingInfoModel {
  email?: string;
  /** @format date-time */
  cdt?: string;
  feedback?: string;
  positive?: boolean;
}

export interface AuthRequestModel {
  mnemonicHash?: string;
  masterPublicKey?: string;
  deviceId?: string;
  deviceToken?: string;
  signature?: string;
  publicKey?: string;
  name?: string;
}

export interface AuthResponseModel {
  apikey?: string;
  startSocket?: boolean;
  hasExchanger?: boolean;
}

export interface ExchangerInfoModel {
  /** @format int64 */
  id?: number;
  /** @format int32 */
  rating?: number;
  /** @format int64 */
  userId?: number;
}

export interface UserModel {
  /** @format int64 */
  id?: number;
  name?: string;
  avatar?: string;
  active?: boolean;
  exchangerSettings?: ExchangerSettingsInfoModel[];
  userInfo?: ExchangerInfoModel;
  startSocket?: boolean;
  hasExchanger?: boolean;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  provider?: "DEXTRADE" | "EXOLIX" | "PANCAKE" | "UNISWAP" | "DEXPAY";
  rating?: TotalRatingResponseModel;
  /** @format int32 */
  exchangeCount?: number;
  /** @format double */
  exchangeCompletionRate?: number;
}

export interface IdNameModel {
  /** @format int64 */
  id?: number;
  name?: string;
}

export interface AvatarModel {
  avatar?: string;
}

export interface DeviceIdRequestModel {
  deviceId?: string;
}

export interface TestModel {
  data?: string;
}

export interface StatisticRequestModel {
  /** @format int64 */
  startTimestamp?: number;
  /** @format int64 */
  endTimestamp?: number;
  ticker?: string;
}

export interface StatisticResponseModel {
  totalInUSDT?: number;
  totalInBTC?: number;
  totalInETH?: number;
  /** @format int64 */
  transactionCount?: number;
  statistics?: StatisticModel[];
}

export interface PaymentMethodsCreateModel {
  /** @format int64 */
  userPaymentMethodId?: number;
  /** @format int64 */
  paymentMethodId?: number;
  currency?: string;
  /** @format int64 */
  userId?: number;
  balance?: number;
  data?: string;
}

export interface PaymentBalanceUpdateModel {
  /** @format int64 */
  id?: number;
  balance?: number;
}

export interface IdRequestModel {
  /** @format int64 */
  id?: number;
}

export interface PaymentCreateExchangeRequestModel {
  addressTo?: string;
  senderAddress?: string;
  /** @format uuid */
  exchangeId?: string;
  rate?: number;
  amountFrom?: number;
  fromTicker?: string;
  toTicker?: string;
  fromNetworkType?: string;
  toNetworkType?: string;
}

export interface PriceApiKeyInfoRequestModel {
  apiKey?: string;
}

export interface PriceApiKeyRequestLimitModel {
  /** @format int64 */
  resetTimestamp?: number;
  /** @format int32 */
  monthLimit?: number;
  /** @format int32 */
  requestUsed?: number;
  /** @format int32 */
  requestLeft?: number;
}

export interface FeeEstimateModel {
  from?: string;
  to?: string;
  value?: number;
  network?:
    | "ethereum"
    | "tron"
    | "the_open_network"
    | "binance_smart_chain"
    | "binance_chain"
    | "polygon"
    | "optimism"
    | "gnosis"
    | "fantom"
    | "avalanche"
    | "solana"
    | "bitcoin"
    | "elrond"
    | "litecoin"
    | "dash"
    | "dogecoin"
    | "zcash"
    | "ecash"
    | "bitcoin_cash"
    | "fiat"
    | "arbitrumOne"
    | "xdc_network";
  data?: string;
  parameter?: string;
  contractAddress?: string;
}

export interface OnOffSettingsRequestModel {
  /** @format int64 */
  id?: number;
  active?: boolean;
}

export interface ExchangerSettingsCreateModel {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  userId?: number;
  active?: boolean;
  priceAdjustment?: number;
  transactionFee?: number;
  walletAddress?: string;
  walletAddressInNetwork2?: string;
  coinPair?: CoinPairsModel;
  from?: CoinModel;
  to?: CoinModel;
  reserve?: ReserveModel[];
  priceCoin1InCoin2?: number;
  minimumExchangeAmountCoin1?: number;
  minimumExchangeAmountCoin2?: number;
  maximumExchangeAmountCoin1?: number;
  maximumExchangeAmountCoin2?: number;
  reserveLimitation?: number;
  /** @format int64 */
  timeToPay?: number;
  paymentMethods?: PaymentMethodsModel[];
  statistic?: StatisticModel;
  isAtomicSwap?: boolean;
  /** @format int64 */
  timeToRefund?: number;
  /** @format double */
  slippage?: number;
  exchangersPolicy?: string;
  /** @format double */
  amlRiskLimit?: number;
  provider?: "DEXTRADE" | "EXOLIX" | "PANCAKE" | "UNISWAP" | "DEXPAY";
  tradeWithKycUsers?: boolean;
}

export interface ReserveRequestModel {
  reserves?: ReserveModel[];
  /** @format int64 */
  timestamp?: number;
}

export interface PaymentMethodsDeleteModel {
  /** @format int64 */
  exchangerSettingsId?: number;
  /** @format int64 */
  paymentMethodId?: number;
}

export interface CreateRatingModel {
  /** @format uuid */
  exchangeId?: string;
  rating?: string;
  feedback?: string;
}

export interface ExchangeFilterModel {
  fromTicker?: string;
  toTicker?: string;
  ticker?: string;
  includedStatuses?: (
    | "WAIT_EXCHANGER_VERIFY"
    | "NEW"
    | "EXPIRED"
    | "CLIENT_TRANSACTION_FAILED"
    | "EXCHANGER_TRANSACTION_FAILED"
    | "CLIENT_TRANSACTION_VERIFY"
    | "EXCHANGER_TRANSACTION_VERIFY"
    | "WAIT_EXCHANGER_TRANSFER"
    | "VERIFIED"
    | "COMPLETED"
    | "CANCELED"
    | "DISPUTE"
  )[];
  excludedStatuses?: (
    | "WAIT_EXCHANGER_VERIFY"
    | "NEW"
    | "EXPIRED"
    | "CLIENT_TRANSACTION_FAILED"
    | "EXCHANGER_TRANSACTION_FAILED"
    | "CLIENT_TRANSACTION_VERIFY"
    | "EXCHANGER_TRANSACTION_VERIFY"
    | "WAIT_EXCHANGER_TRANSFER"
    | "VERIFIED"
    | "COMPLETED"
    | "CANCELED"
    | "DISPUTE"
  )[];
  orderBy?: "BY_FEE" | "BY_PRICE" | "BY_EARNED" | "BY_SPEND" | "BY_DATE";
  sort?: "DESC" | "ASC";
  isExchanger?: boolean;
  network?:
    | "ethereum"
    | "tron"
    | "the_open_network"
    | "binance_smart_chain"
    | "binance_chain"
    | "polygon"
    | "optimism"
    | "gnosis"
    | "fantom"
    | "avalanche"
    | "solana"
    | "bitcoin"
    | "elrond"
    | "litecoin"
    | "dash"
    | "dogecoin"
    | "zcash"
    | "ecash"
    | "bitcoin_cash"
    | "fiat"
    | "arbitrumOne"
    | "xdc_network";
  /** @format int64 */
  dateFrom?: number;
  /** @format int64 */
  dateTo?: number;
  /** @format int64 */
  page?: number;
  /** @format int64 */
  size?: number;
}

export interface ReserveExchangeModel {
  /** @format int64 */
  timestamp?: number;
  reserves?: ReserveVerifyModel[];
}

export interface ReserveVerifyModel {
  /** @format uuid */
  id?: string;
  isConfirmed?: boolean;
  exchangerConfirmedAmount?: number;
  params?: string;
}

export interface SaveResponseModel {
  id?: string;
  name?: string;
}

export interface RetrieveSafeRequestModel {
  /** @format uuid */
  exchangeId?: string;
  transactionHash?: string;
  address?: string;
  amount?: number;
  /** @format int32 */
  vout?: number;
}

export interface ExchangerSendFiatRequestModel {
  /** @format uuid */
  id?: string;
  amount?: number;
}

export interface ExchangerSendCryptoRequestModel {
  /** @format uuid */
  id?: string;
  transactionHash?: string;
  fee?: number;
  amount?: number;
}

export interface ExchangerResendCryptoRequestModel {
  /** @format uuid */
  id?: string;
  transactionHash?: string;
}

export interface UUIDRequestModel {
  /** @format uuid */
  id?: string;
}

export interface NewExchangeModel {
  /** @format int64 */
  exchangerSettingsId?: number;
  /** @format int64 */
  exchangerPaymentMethodId?: number;
  clientWalletAddress?: string;
  clientWalletAddressInNetwork2?: string;
  amount1?: number;
  amount2?: number;
  /** @format double */
  clientSlippage?: number;
  params?: string;
}

export interface CreatedExchangeModel {
  /** @format uuid */
  id?: string;
  /** @format int64 */
  exchangerSettingsId?: number;
  /** @format int64 */
  clientId?: number;
  clientWalletAddress?: string;
  amount1?: number;
  amount2?: number;
  fee?: number;
  /** @format int64 */
  paymentMethodId?: number;
  exchangeWalletAddress?: string;
  clientParams?: string;
}

export interface NewExchangeFiatModel {
  /** @format int64 */
  exchangerSettingsId?: number;
  amount1?: number;
  amount2?: number;
  /** @format int64 */
  clientPaymentMethodId?: number;
  sessionId?: string;
  params?: string;
}

export interface ClientSendCryptoRequestModel {
  /** @format uuid */
  id?: string;
  transactionHash?: string;
  clientAddress?: string;
  params?: string;
}

export interface ImageModel {
  data?: string;
}

export interface ClaimSwapOwnerModel {
  swapId?: string;
  password?: string;
  rateOfFeeInNative?: string;
  contractAddress?: string;
}

export interface AmlTransactionRequestModel {
  transactionHash?: string;
  recipientAddress?: string;
  direction?: string;
  ticker?: string;
}

export interface AmlExchangeRequestModel {
  /** @format uuid */
  exchangeId?: string;
  verificationType?: string;
}

export interface AmlAddressRequestModel {
  address?: string;
  ticker?: string;
}

export interface TariffModel {
  /** @format int64 */
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  /** @format int64 */
  amlRequests?: number;
  includeKyc?: boolean;
  isDefault?: boolean;
}

export interface SettingsModel {
  isP2PEnabled?: boolean;
  isKycEnabled?: boolean;
}

export interface ReviewModel {
  /** @format int64 */
  id?: number;
  /** @format uuid */
  exchangeId?: string;
  /** @format int64 */
  exchangerId?: number;
  /** @format int64 */
  clientId?: number;
  /** @format int32 */
  rating?: number;
  /** @format int32 */
  punishment?: number;
  amount?: number;
  comment?: string;
  /** @format int64 */
  cdt?: number;
}

export interface PaymentOrderInvoiceModel {
  address?: string;
}

export interface PaymentOrderResponseModel {
  invoice?: PaymentOrderInvoiceModel;
  /** @format int32 */
  status?: number;
}

export interface UserSessionInfoModel {
  isSessionActive?: boolean;
  isUserActive?: boolean;
}

export interface UserTariffModel {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  amlRequests?: number;
  includeKyc?: boolean;
}

export interface PaymentInfoModel {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  userId?: number;
  /** @format int64 */
  paymentUserId?: number;
  /** @format int64 */
  paymentId?: number;
  address?: string;
  currency?: "ETH" | "BNB" | "TRX" | "BTC" | "USDT";
  network?: "ethereum" | "binance_smart_chain" | "tron" | "bitcoin";
  payments?: PaymentModel[];
}

export interface PaymentModel {
  /** @format int64 */
  id?: number;
  amount?: number;
  /** @format int64 */
  paymentInfoId?: number;
  type?: string;
  fromAddress?: string;
  toAddress?: string;
  networkFee?: number;
  currency?: string;
  txid?: string;
  /** @format int64 */
  paymentId?: number;
}

export interface PaymentPricesModel {
  eth?: number;
  bnb?: number;
  btc?: number;
  trx?: number;
  usdt?: number;
}

export interface KycModel {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  userId?: number;
  verificationId?: string;
  verificationUrl?: string;
  status?: "AWAITING" | "UNUSED" | "PENDING" | "VERIFIED" | "DECLINED";
}

export interface PriceApiKeyModel {
  /** @format int64 */
  id?: number;
  apiKey?: string;
  apiSecret?: string;
  provider?: "COIN_MARKET_CUP";
  purpose?: "SERVER" | "PLATFORM";
  /** @format int32 */
  requestLimit?: number;
}

export interface ExchangerMinModel {
  /** @format int64 */
  id?: number;
  active?: boolean;
}

export interface IdNetworkModel {
  /** @format int64 */
  id?: number;
  name?:
    | "ethereum"
    | "tron"
    | "the_open_network"
    | "binance_smart_chain"
    | "binance_chain"
    | "polygon"
    | "optimism"
    | "gnosis"
    | "fantom"
    | "avalanche"
    | "solana"
    | "bitcoin"
    | "elrond"
    | "litecoin"
    | "dash"
    | "dogecoin"
    | "zcash"
    | "ecash"
    | "bitcoin_cash"
    | "fiat"
    | "arbitrumOne"
    | "xdc_network";
}

export interface CoinPairAggregatorModel {
  /** @format int64 */
  id?: number;
  currencyAggregator?: "BINANCE" | "CRYPTO_COMPARE" | "COIN_MARKET_CUP" | "DEXPAY" | "COIN_GECKO" | "FIXED_PRICE";
  price?: number;
  priceCoin1InUsdt?: number;
  priceCoin2InUsdt?: number;
}

export interface CoinPairsAggregatorsModel {
  aggregators?: CoinPairAggregatorModel[];
  lowestPrice?: number;
}
