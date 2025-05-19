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

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}

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
    | "xdc_network"
    | "lightning"
    | "taraxa"
    | "somnia";
  reserve?: number;
}

export interface CoinPairsCreateModel {
  currencyAggregator?:
    | "BINANCE"
    | "CRYPTO_COMPARE"
    | "COIN_MARKET_CUP"
    | "BTSE"
    | "DEXPAY"
    | "COIN_GECKO"
    | "SWAPKIT"
    | "FIXED_PRICE";
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

export interface ProviderUserExchangerSettingsCreateModel {
  projectName?: string;
  /** @format int64 */
  userId?: number;
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
  fromCoin?: CoinCreateModel;
  toCoin?: CoinCreateModel;
  coinPair?: CoinPairsCreateModel;
  createReversedPair?: boolean;
  addressToReceive?: string;
  addressToSendFrom?: string;
  exchangersPolicy?: string;
  optionalSettings?: ProviderOptionalExchangerSettingsModel;
  reversedOptionalSettings?: ProviderOptionalExchangerSettingsModel;
  /** @format int64 */
  pairId?: number;
}

export interface ProviderExchangerSettingsResponseModel {
  /** @format int64 */
  exchangerSettingsId?: number;
  /** @format int64 */
  reversedExchangerSettingsId?: number;
}

export interface TestModel {
  data?: string;
}

export interface AffiliateFee {
  brokerAddress?: string;
  /** @format int32 */
  feeBps?: number;
}

export interface Asset {
  asset?: string;
  /** @format double */
  price?: number;
  image?: string;
}

export interface BuyAsset {
  chain?: string;
  asset?: string;
}

export interface Chainflip {
  sellAsset?: SellAsset;
  buyAsset?: BuyAsset;
  destinationAddress?: string;
  channelMetadata?: ChannelMetadata;
  affiliateFees?: AffiliateFee[];
  refundParameters?: RefundParameters;
  dcaParameters?: DcaParameters;
  /** @format int32 */
  brokerCommissionBps?: number;
  /** @format int32 */
  maxBoostFeeBps?: number;
}

export interface ChannelMetadata {
  cfParameters?: string;
  gasBudget?: string;
  message?: string;
}

export interface DcaParameters {
  /** @format int32 */
  chunkInterval?: number;
  /** @format int32 */
  numberOfChunks?: number;
}

export interface EstimatedTime {
  /** @format double */
  inbound?: number;
  /** @format double */
  swap?: number;
  /** @format double */
  outbound?: number;
  /** @format double */
  total?: number;
}

export interface Fee {
  type?: string;
  amount?: string;
  asset?: string;
  chain?: string;
  protocol?: string;
}

export interface Kado {
  widgetUrl?: string;
}

export interface Leg {
  provider?: string;
  sellAsset?: string;
  sellAmount?: string;
  buyAsset?: string;
  buyAmount?: string;
  buyAmountMaxSlippage?: string;
  fees?: Fee[];
}

export interface Meta {
  /** @format double */
  priceImpact?: number;
  assets?: Asset[];
  approvalAddress?: string;
  /** @format int32 */
  streamingInterval?: number;
  /** @format int32 */
  maxStreamingQuantity?: number;
  tags?: string[];
  affiliate?: string;
  affiliateFee?: string;
  referrer?: string;
  txType?: string;
  chainflip?: Chainflip;
  kado?: Kado;
}

export interface ProviderError {
  provider?: string;
  errorCode?: string;
  message?: string;
}

export interface RefundParameters {
  minPrice?: string;
  refundAddress?: string;
  /** @format int32 */
  retryDuration?: number;
}

export interface Route {
  providers?: string[];
  sellAsset?: string;
  sellAmount?: string;
  buyAsset?: string;
  expectedBuyAmount?: string;
  expectedBuyAmountMaxSlippage?: string;
  sourceAddress?: string;
  destinationAddress?: string;
  targetAddress?: string;
  inboundAddress?: string;
  expiration?: string;
  memo?: string;
  fees?: Fee[];
  txType?: string;
  tx?: Tx;
  estimatedTime?: EstimatedTime;
  /** @format int32 */
  totalSlippageBps?: number;
  legs?: Leg[];
  warnings?: Warning[];
  meta?: Meta;
}

export interface SellAsset {
  chain?: string;
  asset?: string;
}

export interface SwapKitQuoteResponseModel {
  quoteId?: string;
  routes?: Route[];
  error?: string;
  providerErrors?: ProviderError[];
}

export interface Tx {
  to?: string;
  from?: string;
  gas?: string;
  gasPrice?: string;
  value?: string;
  data?: string;
}

export interface Warning {
  code?: string;
  display?: string;
  tooltip?: string;
}

export interface SwapKitQuoteRequestModel {
  sellAsset?: string;
  buyAsset?: string;
  sellAmount?: string;
  providers?: string[];
  sourceAddress?: string;
  destinationAddress?: string;
  /** @format double */
  slippage?: number;
  affiliate?: string;
  /** @format double */
  affiliateFee?: number;
  allowSmartContractSender?: boolean;
  allowSmartContractReceiver?: boolean;
  disableSecurityChecks?: boolean;
  includeTx?: boolean;
  cfBoost?: boolean;
  referrer?: string;
}

export interface SwapKitNewTradeByAdIdModel {
  /** @format int64 */
  exchangerSettingsId?: number;
  clientWalletAddress?: string;
  clientWalletAddressInNetwork2?: string;
  amount1?: number;
  /** @format double */
  clientSlippage?: number;
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
    | "xdc_network"
    | "lightning"
    | "taraxa"
    | "somnia";
  /** @format int64 */
  networkId?: number;
}

export interface SwapKitNewTradeByCoinsModel {
  from?: CoinModel;
  to?: CoinModel;
  clientWalletAddress?: string;
  clientWalletAddressInNetwork2?: string;
  amount1?: number;
  /** @format double */
  clientSlippage?: number;
}

export interface ProviderUserUpdateModel {
  projectName?: string;
  /** @format int64 */
  userId?: number;
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface ProviderUserAvatarModel {
  projectName?: string;
  /** @format int64 */
  userId?: number;
  avatar?: string;
}

export interface CoinUpdateModel {
  /** @format int64 */
  coinId?: number;
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
    | "xdc_network"
    | "lightning"
    | "taraxa"
    | "somnia";
  reserve?: number;
}

export interface ProviderReserveUpdateModelV2 {
  projectName?: string;
  /** @format int64 */
  userId?: number;
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
  coin?: CoinUpdateModel;
  /** @format int64 */
  exchangerSettingsId?: number;
}

export interface ProviderReserveListUpdateModel {
  projectName?: string;
  users?: ProviderUserReserveModel[];
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
}

export interface ProviderReserveModel {
  coin?: CoinUpdateModel;
  /** @format int64 */
  exchangerSettingsId?: number;
  message?: string;
  updated?: boolean;
}

export interface ProviderUserReserveModel {
  /** @format int64 */
  userId?: number;
  reserves?: ProviderReserveModel[];
  message?: string;
}

export interface ProviderReserveBatchResponseModel {
  users?: ProviderUserReserveModel[];
}

export interface ProviderReserveUpdateModel {
  projectName?: string;
  /** @format int64 */
  userId?: number;
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
  coin?: CoinUpdateModel;
}

export interface ProviderExchangerSettingsStatusRequestModel {
  projectName?: string;
  /** @format int64 */
  exchangerSettingsId?: number;
  status?: boolean;
  /** @format int64 */
  userId?: number;
}

export interface ProviderAdStatusModel {
  /** @format int64 */
  exchangerSettingsId?: number;
  status?: boolean;
  message?: string;
  updated?: boolean;
}

export interface ProviderExchangerSettingsStatusListUpdateModel {
  projectName?: string;
  users?: ProviderUserAdStatusModel[];
}

export interface ProviderUserAdStatusModel {
  /** @format int64 */
  userId?: number;
  ads?: ProviderAdStatusModel[];
  message?: string;
}

export interface ProviderAdStatusBatchResponseModel {
  users?: ProviderUserAdStatusModel[];
}

export interface ProviderUserExchangerSettingsUpdateModel {
  projectName?: string;
  /** @format int64 */
  exchangerSettingsId?: number;
  /** @format int64 */
  userId?: number;
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
  fromCoin?: CoinCreateModel;
  toCoin?: CoinCreateModel;
  coinPair?: CoinPairsCreateModel;
  addressToReceive?: string;
  addressToSendFrom?: string;
  exchangersPolicy?: string;
  optionalSettings?: ProviderOptionalExchangerSettingsModel;
  /** @format int64 */
  pairId?: number;
  /** @format int32 */
  direction?: number;
}

export interface ProviderPushExternalSignerTaskModel {
  projectName?: string;
  mnemonicHash?: string;
  backgroundPush?: boolean;
}

export interface ProviderExchangerSettingsListRequestModel {
  projectName?: string;
  /** @format int64 */
  userId?: number;
  /** @format int64 */
  page?: number;
  /** @format int64 */
  size?: number;
}

export interface BankDictModel {
  /** @format int64 */
  paymentMethodId?: number;
  name?: string;
  description?: string;
  isAtm?: boolean;
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
  value?: string;
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
  priceInCoin2?: number;
  priceCoin1InUsdt?: number;
  priceCoin2InUsdt?: number;
  currencyAggregator?:
    | "BINANCE"
    | "CRYPTO_COMPARE"
    | "COIN_MARKET_CUP"
    | "BTSE"
    | "DEXPAY"
    | "COIN_GECKO"
    | "SWAPKIT"
    | "FIXED_PRICE";
  flipped?: boolean;
  /** @format int64 */
  parentId?: number;
  /** @format int64 */
  userId?: number;
  /** @format int64 */
  dexpayPairId?: number;
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
  isReactiveAtomicSwap?: boolean;
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
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
  /** @format int64 */
  pairId?: number;
  /** @format int32 */
  direction?: number;
  /** @format int64 */
  cdt?: number;
  transactionFeeType?:
    | "TransactionFeeType.NETWORK"
    | "TransactionFeeType.EXHANGER_PAY"
    | "TransactionFeeType.FIXED"
    | "TransactionFeeType.FIXED_AND_NETWORK";
  transactionFeeFixedValue?: number;
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
  balance?: number;
  /** @format int64 */
  userId?: number;
  data?: string;
  balanceRequired?: boolean;
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

export interface PaginatedAdListModel {
  /** @format int64 */
  adsTotalCount?: number;
  /** @format int64 */
  currentPage?: number;
  /** @format int64 */
  totalPages?: number;
  ads?: ExchangerSettingsInfoModel[];
}

export interface ProviderExchangerSettingsRequestModel {
  projectName?: string;
  /** @format int64 */
  exchangerSettingsId?: number;
}

export interface ProviderUserExchangerSettingsDeleteModel {
  projectName?: string;
  /** @format int64 */
  exchangerSettingsId?: number;
  /** @format int64 */
  userId?: number;
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
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

export interface ProviderCoinCreateModel {
  projectName?: string;
  name?: string;
}

export interface PriceResponseModel {
  /** @format int64 */
  last_updated?: number;
  /** @format int64 */
  price_change_24h?: number;
  price?: number;
  uid?: string;
}

export interface ExchangeModel {
  /** @format uuid */
  id?: string;
  isExchanger?: boolean;
  isClient?: boolean;
  clientPaymentMethod?: PaymentMethodsModel;
  clientPaymentMethods?: PaymentMethodsModel[];
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
  clientWalletAddressInNetwork2?: string;
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
  fromAggregator?:
    | "BINANCE"
    | "CRYPTO_COMPARE"
    | "COIN_MARKET_CUP"
    | "BTSE"
    | "DEXPAY"
    | "COIN_GECKO"
    | "SWAPKIT"
    | "FIXED_PRICE";
  toAggregator?:
    | "BINANCE"
    | "CRYPTO_COMPARE"
    | "COIN_MARKET_CUP"
    | "BTSE"
    | "DEXPAY"
    | "COIN_GECKO"
    | "SWAPKIT"
    | "FIXED_PRICE";
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
    | "xdc_network"
    | "lightning"
    | "taraxa"
    | "somnia";
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
    | "xdc_network"
    | "lightning"
    | "taraxa"
    | "somnia";
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
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
  clientIp?: Inet;
  clientCountry?: string;
  /** @format int64 */
  invoiceId?: number;
  invoiceUrl?: string;
  isInvoicePayment?: boolean;
  transactionFeeType?:
    | "TransactionFeeType.NETWORK"
    | "TransactionFeeType.EXHANGER_PAY"
    | "TransactionFeeType.FIXED"
    | "TransactionFeeType.FIXED_AND_NETWORK";
  transactionFeeFixedValue?: number;
}

export interface Inet {
  address?: string;
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
    | "xdc_network"
    | "lightning"
    | "taraxa"
    | "somnia";
  orderBy?: "BY_PRICE" | "BY_RATING" | "BY_RESERVE" | "BY_VOLUME" | "BY_TRADES" | "BY_DATE";
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
    | "xdc_network"
    | "lightning"
    | "taraxa"
    | "somnia";
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
  tradeVolumeInUSDT?: number;
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
  isReactiveAtomicSwap?: boolean;
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
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
  officialMerchant?: boolean;
  hasReversed?: boolean;
  transactionFeeType?:
    | "TransactionFeeType.NETWORK"
    | "TransactionFeeType.EXHANGER_PAY"
    | "TransactionFeeType.FIXED"
    | "TransactionFeeType.FIXED_AND_NETWORK";
  transactionFeeFixedValue?: number;
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

export interface ChangellyExchangeModel {
  amount?: number;
  external_id?: string;
  from_crypto?: string;
  from_network?: string;
  to_crypto?: string;
  to_network?: string;
  to_address?: string;
}

export interface DepositData {
  external_id?: string;
  uid?: string;
  deposit_address?: string;
  deposit_extension_type_name?: string;
  deposit_extension?: string;
}

export interface BtseExchangeCallBackModel {
  type?: string;
  status?: string;
  address?: string;
  asset?: string;
  network?: string;
  amount?: string;
  /** @format int64 */
  transactionTime?: number;
  transactionHash?: string;
  transactionRef?: string;
}

export interface AuthRequestModel {
  mnemonicHash?: string;
  masterPublicKey?: string;
  deviceId?: string;
  deviceToken?: string;
  signature?: string;
  publicKey?: string;
  name?: string;
  /** @format int64 */
  telegramUserId?: number;
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
  fullName?: string;
  email?: string;
  phone?: string;
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
  rating?: TotalRatingResponseModel;
  /** @format int32 */
  exchangeCount?: number;
  /** @format double */
  exchangeCompletionRate?: number;
  /** @format int64 */
  telegramId?: number;
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
  id?: number;
  /** @format int64 */
  paymentMethodId?: number;
  /** @format int64 */
  currencyId?: number;
  /** @format int64 */
  userId?: number;
  balance?: number;
  remove?: boolean;
}

export interface PaymentBalanceUpdateModel {
  /** @format int64 */
  id?: number;
  balance?: number;
}

export interface PaymentMethodsCreateV2Model {
  /** @format int64 */
  id?: number;
  balance?: number;
  paymentMethod?: BankDictModel;
  currency?: PaymentMethodCurrencyModel;
  remove?: boolean;
}

export interface PaymentMethodsFullModel {
  /** @format int64 */
  userPaymentMethodId?: number;
  balance?: number;
  paymentMethod?: BankDictModel;
  currency?: PaymentMethodCurrencyModel;
  fields?: BankFieldsInfoModel[];
  balanceRequired?: boolean;
}

export interface PaymentMethodsListCreateModel {
  paymentMethods?: PaymentMethodsCreateV2Model[];
}

export interface IdRequestModel {
  /** @format int64 */
  id?: number;
}

export interface BankDictCreateModel {
  /** @format int64 */
  paymentMethodId?: number;
  name?: string;
  description?: string;
  currency?: string;
  fields?: BankFieldsInfoModel[];
}

export interface FijaAddressRequestModel {
  address?: string;
  currency?: string;
  strategy?: string;
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
  transactionFee?: number;
  priceAdjustment?: number;
}

export interface InvoiceModel {
  /** @format int64 */
  tariffId?: number;
}

export interface InvoiceResponseModel {
  /** @format int64 */
  id?: number;
  public_id?: string;
  payment_page_id?: string;
  address?: string;
  amount_requested?: string;
  amount_received_total?: string;
  /** @format int32 */
  status?: number;
  description?: string;
  order_id?: string;
  invoice_number?: string;
  customer_email?: string;
  due_to?: string;
  discounts?: string;
  tax?: string;
  payment_page_url?: string;
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
    | "xdc_network"
    | "lightning"
    | "taraxa"
    | "somnia";
  data?: string;
  parameter?: string;
  contractAddress?: string;
  isToken?: boolean;
  /** @format int64 */
  userId?: number;
  toNetwork?: string;
  amount?: number;
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
  transactionFeeInCoinTwo?: number;
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
  isReactiveAtomicSwap?: boolean;
  /** @format int64 */
  timeToRefund?: number;
  /** @format double */
  slippage?: number;
  exchangersPolicy?: string;
  /** @format double */
  amlRiskLimit?: number;
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
  tradeWithKycUsers?: boolean;
  /** @format int64 */
  pairId?: number;
  /** @format int32 */
  direction?: number;
  transactionFeeType?:
    | "TransactionFeeType.NETWORK"
    | "TransactionFeeType.EXHANGER_PAY"
    | "TransactionFeeType.FIXED"
    | "TransactionFeeType.FIXED_AND_NETWORK";
  transactionFeeFixedValue?: number;
}

export interface ReserveRequestModel {
  reserves?: ReserveModel[];
  /** @format int64 */
  timestamp?: number;
}

export interface ExchangerModelMin {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  coinId?: number;
  /** @format int64 */
  coinFromId?: number;
  reserveLimitation?: number;
  paymentMethods?: PaymentMethodsModel[];
  priceInCoin2?: number;
  transactionFee?: number;
  priceAdjustment?: number;
  minimumExchangeAmountCoin1?: number;
  minimumExchangeAmountCoin2?: number;
  maximumExchangeAmountCoin1?: number;
  maximumExchangeAmountCoin2?: number;
  avatar?: string;
  name?: string;
  rating?: TotalRatingResponseModel;
  /** @format int32 */
  exchangeCount?: number;
  tradeVolumeInUSDT?: number;
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
  isAtomicSwap?: boolean;
  isReactiveAtomicSwap?: boolean;
  isKycVerified?: boolean;
  /** @format double */
  amlRiskLimit?: number;
  /** @format int32 */
  daysSinceRegistration?: number;
  /** @format int32 */
  daysSinceFirstExchange?: number;
  /** @format int32 */
  counterpartiesCount?: number;
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
  officialMerchant?: boolean;
  hasReversed?: boolean;
  transactionFeeType?:
    | "TransactionFeeType.NETWORK"
    | "TransactionFeeType.EXHANGER_PAY"
    | "TransactionFeeType.FIXED"
    | "TransactionFeeType.FIXED_AND_NETWORK";
  transactionFeeFixedValue?: number;
  exchangerActive?: boolean;
}

export interface PaymentMethodsDeleteModel {
  /** @format int64 */
  exchangerSettingsId?: number;
  /** @format int64 */
  paymentMethodId?: number;
}

export interface PriceHistoryChartRequestModel {
  pairs?: string[];
  /** @format int32 */
  width?: number;
  /** @format int32 */
  height?: number;
  /** @format int64 */
  points?: number;
}

export interface CreateRatingModel {
  /** @format uuid */
  exchangeId?: string;
  rating?: string;
  feedback?: string;
}

export interface ItrxRequestEnergyModel {
  address?: string;
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
  orderBy?: "BY_FEE" | "BY_PRICE" | "BY_EARNED" | "BY_SPEND" | "BY_DATE" | "BY_DATE_DESC";
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
    | "xdc_network"
    | "lightning"
    | "taraxa"
    | "somnia";
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
  networkFee?: number;
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

export interface DexPayEstimateFeeRequestModel {
  addressTo?: string;
  /** @format int64 */
  exchangerSettingsId?: number;
}

export interface DexPayFeeResponseModel {
  rateOfSecondInNative?: RateOfSecondInNative;
  txEstimatedFee?: TxEstimatedFee;
  estimatedFeeInCurrencyTo?: number;
  /** @format int32 */
  currencyFromId?: number;
  /** @format int32 */
  currencyToId?: number;
}

export interface RateData {
  rate?: string;
}

export interface RateOfSecondInNative {
  rateData?: RateData;
}

export interface TxEstimatedFee {
  fee?: string;
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
  paymentMethodIds?: number[];
  exchangeWalletAddress?: string;
  clientParams?: string;
}

export interface NewExchangeFiatModel {
  /** @format int64 */
  exchangerSettingsId?: number;
  amount1?: number;
  amount2?: number;
  clientWalletAddress?: string;
  /** @format int64 */
  clientPaymentMethodId?: number;
  clientPaymentMethodIds?: number[];
  sessionId?: string;
  params?: string;
  isInvoicePayment?: boolean;
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

export interface TronScanBroadcastRequestModel {
  tx?: string;
  senderAddress?: string;
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

export interface Input {
  /** @format int64 */
  sequence?: number;
  witness?: string;
  script?: string;
  /** @format int32 */
  index?: number;
  prev_out?: PrevOut;
}

export interface Output {
  /** @format int32 */
  type?: number;
  spent?: boolean;
  value?: number;
  spending_outpoints?: SpendingOutpoint[];
  /** @format int32 */
  n?: number;
  /** @format int64 */
  tx_index?: number;
  script?: string;
  addr?: string;
}

export interface PrevOut {
  /** @format int32 */
  type?: number;
  spent?: boolean;
  /** @format int64 */
  value?: number;
  spending_outpoints?: SpendingOutpoint[];
  /** @format int32 */
  n?: number;
  /** @format int64 */
  tx_index?: number;
  script?: string;
  addr?: string;
}

export interface SpendingOutpoint {
  /** @format int64 */
  tx_index?: number;
  /** @format int32 */
  n?: number;
}

export interface Transaction {
  hash?: string;
  /** @format int32 */
  ver?: number;
  /** @format int32 */
  vin_sz?: number;
  /** @format int32 */
  vout_sz?: number;
  /** @format int32 */
  size?: number;
  /** @format int32 */
  weight?: number;
  /** @format int32 */
  fee?: number;
  relayed_by?: string;
  /** @format int32 */
  lock_time?: number;
  /** @format int64 */
  tx_index?: number;
  double_spend?: boolean;
  /** @format int64 */
  time?: number;
  /** @format int32 */
  block_index?: number;
  /** @format int32 */
  block_height?: number;
  inputs?: Input[];
  out?: Output[];
  /** @format int64 */
  result?: number;
  /** @format int64 */
  balance?: number;
  rbf?: boolean;
}

export interface BtseNetworksModel {
  name?: string;
}

export interface TxInputs {
  script_type?: string;
  addresses?: string[];
  prev_hash?: string;
  /** @format int64 */
  output_index?: number;
  /** @format int64 */
  output_value?: number;
  script?: string;
  /** @format int64 */
  sequence?: number;
  /** @format int32 */
  age?: number;
  wallet_name?: string;
  wallet_token?: string;
}

export interface TxModel {
  /** @format int64 */
  block_height?: number;
  hash?: string;
  addresses?: string[];
  /** @format int64 */
  total?: number;
  /** @format int64 */
  fees?: number;
  /** @format int64 */
  size?: number;
  /** @format int64 */
  vsize?: number;
  preference?: string;
  relayed_by?: string;
  received?: string;
  /** @format int64 */
  ver?: number;
  /** @format int64 */
  lock_time?: number;
  double_spend?: boolean;
  /** @format int64 */
  vin_sz?: number;
  /** @format int64 */
  vout_sz?: number;
  /** @format int64 */
  confirmations?: number;
  inputs?: TxInputs[];
  outputs?: TxOutputs[];
  opt_in_rbf?: boolean;
  /** @format float */
  confidence?: number;
  confirmed?: string;
  /** @format int32 */
  receive_count?: number;
  change_address?: string;
  block_hash?: string;
  /** @format int32 */
  block_index?: number;
  double_of?: string;
  data_protocol?: string;
  hex?: string;
  next_inputs?: string;
  next_outputs?: string;
}

export interface TxOutputs {
  /** @format int64 */
  value?: number;
  addresses?: string[];
  script?: string;
  script_type?: string;
  spent_by?: string;
  data_hex?: string;
  data_string?: string;
}

export interface TxSkeletonModel {
  tx?: TxModel;
  signatures?: string[];
  tosign?: string[];
  pubkeys?: string[];
}

export interface TariffModel {
  /** @format int64 */
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  /** @format int64 */
  amlRequests?: number;
  /** @format int64 */
  refillGasRequests?: number;
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
  payment_page_url?: string;
}

export interface PaymentOrderResponseModel {
  invoice?: PaymentOrderInvoiceModel;
  amount_from_requested?: number;
  /** @format int32 */
  status?: number;
  outgoing_transactions?: PaymentOrderTxModel[];
}

export interface PaymentOrderTxModel {
  txid?: string;
}

export interface UserSessionInfoModel {
  isSessionActive?: boolean;
  isUserActive?: boolean;
}

export interface DataBlock {
  /** @format int32 */
  id?: number;
  external_id?: string;
  /** @format int32 */
  status?: number;
  provider_status?: string;
  transaction?: Transaction;
}

export interface CoinData {
  coin?: string;
  network?: string;
  name?: string;
  ticker?: string;
  depositEnable?: boolean;
  withdrawEnable?: boolean;
  /** @format int32 */
  confirmationTime?: number;
  depositAmtMin?: number;
  depositFeeMin?: number;
  depositFeeRate?: number;
  depositExtFees?: number;
  depositExtFeeRate?: number;
  needAddressExtension?: boolean;
  addressExtensionTypeName?: string;
  withdrawAmtMin?: number;
  withdrawFeeMin?: number;
  withdrawFeeRate?: number;
  withdrawExtFees?: number;
  withdrawExtFeeRate?: number;
  to_coins?: ToCoin[];
}

export interface ExchangeInfo {
  from?: string;
  to?: string;
  networkFee?: number;
  amountFrom?: number;
  amountTo?: number;
  max?: number;
  maxFrom?: number;
  maxTo?: number;
  min?: number;
  minFrom?: number;
  minTo?: number;
  visibleAmount?: number;
  rate?: number;
  fee?: number;
}

export interface Network {
  network?: string;
  minExchAmount?: number;
  exchangeInfo?: ExchangeInfo;
}

export interface ToCoin {
  coin?: string;
  networks?: Network[];
}

export interface ExchangeData {
  from?: string;
  to?: string;
  networkFee?: number;
  amountFrom?: number;
  amountTo?: number;
  max?: number;
  maxFrom?: number;
  maxTo?: number;
  min?: number;
  minFrom?: number;
  minTo?: number;
  visibleAmount?: number;
  rate?: number;
  fee?: number;
}

export interface ProviderCoinsModel {
  /** @format int64 */
  id?: number;
  ticker?: string;
  name?: string;
  coin?: string;
  uuid?: string;
  networkType?: string;
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
    | "xdc_network"
    | "lightning"
    | "taraxa"
    | "somnia";
  provider?:
    | "Provider.DEXTRADE(name=DexTrade)"
    | "Provider.EXOLIX(name=Exolix)"
    | "Provider.PANCAKESWAP(name=PancakeSwap)"
    | "Provider.UNISWAP(name=Uniswap)"
    | "Provider.DEXPAY(name=DexPay)"
    | "Provider.SWAPKIT(name=SwapKit)"
    | "Provider.BTSE(name=BTSE)"
    | "Provider.CHANGELLY(name=CHANGELLY)"
    | "Provider.TRANSAK(name=Transak)"
    | "Provider.OKTO(name=Okto)";
  providerNetwork?: string;
  minAmount?: number;
}

export interface UserTariffModel {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  amlRequests?: number;
  /** @format int64 */
  refillGasRequests?: number;
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

export interface Chain {
  key?: string;
  name?: string;
}

export interface OctavTransactionResponse {
  transactions?: Transaction[];
}

export interface Protocol {
  name?: string;
  key?: string;
}

export interface OctavPortfolioResponse {
  address?: string;
  cashBalance?: string;
  closedPnl?: string;
  dailyIncome?: string;
  dailyExpense?: string;
  fees?: string;
  feesFiat?: string;
  lastUpdated?: string;
  openPnl?: string;
  networth?: string;
  totalCostBasis?: string;
  assetByProtocols?: Record<string, Protocol>;
  chains?: Record<string, Chain>;
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
    | "xdc_network"
    | "lightning"
    | "taraxa"
    | "somnia";
}

export interface ExchangerSettingsGroupModel {
  fromTicker?: string;
  toTicker?: string;
  /** @format int32 */
  total?: number;
  /** @format int32 */
  officialMerchantCount?: number;
  minTradeAmount?: number;
  maxTradeAmount?: number;
  maxReserve?: number;
}

export interface CoinPairAggregatorModel {
  /** @format int64 */
  id?: number;
  currencyAggregator?:
    | "BINANCE"
    | "CRYPTO_COMPARE"
    | "COIN_MARKET_CUP"
    | "BTSE"
    | "DEXPAY"
    | "COIN_GECKO"
    | "SWAPKIT"
    | "FIXED_PRICE";
  price?: number;
  priceCoin1InUsdt?: number;
  priceCoin2InUsdt?: number;
}

export interface CoinPairsAggregatorsModel {
  aggregators?: CoinPairAggregatorModel[];
  lowestPrice?: number;
}
