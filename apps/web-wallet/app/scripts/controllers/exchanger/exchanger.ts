///: BEGIN:ONLY_INCLUDE_IN(pwa)
import { BaseControllerV1 } from '@metamask/base-controller';
import { CompatClient } from '@stomp/stompjs';
import { Mutex } from 'async-mutex';
import { parseEther } from 'ethers/lib/utils';
import OneSignal from 'react-onesignal';
///: END:ONLY_INCLUDE_IN

import exchanger from '.';
import {
  Exchanger,
  ExchangerConfig,
  ExchangerDirection,
  ExchangerState,
} from './types';
import { ORIGIN_METAMASK } from '../../../../shared/constants/app';
import {
  ExchangeP2PStatus,
  ExchangeStatuses,
  ExchangerStatus,
  ExchangerType,
  NetworkNames,
} from '../../../../shared/constants/exchanger';
import { BUILT_IN_NETWORKS } from '../../../../shared/constants/network';
import { HOUR, MINUTE, SECOND } from '../../../../shared/constants/time';
import {
  TransactionStatus,
  TransactionType,
} from '../../../../shared/constants/transaction';
import { AssetModel, CoinModel } from '../../../../shared/lib/asset-model';
import { ATOMIC_SWAP_ABI } from '../../../../shared/lib/atomic-swaps';
import { isSecureFieldsEqual } from '../../../../shared/lib/p2p-utils';
import { calcTokenAmount } from '../../../../shared/lib/transactions-controller-utils';
import { TokensController } from '../../../overrided-metamask/assets-controllers';
import { previousValueComparator } from '../../lib/util';
import ChainsController from '../chains-controller';
import PreferencesController from '../preferences';
import SwapsController from '../swaps';
import TransactionController, { TransactionMeta } from '../transactions';
import DextradeController from '../dextrade';

/**
 * TODO:
 *
 * 1) Exchanger screen, ability to leave and view all pending transactions (now user can switching between tx screens)
 * 2) Expire lock button 10 seconds for client
 * 3) Try again/cancel transactions?
 * 4) Client screen exchange - show comission
 */

/**
 * Controller that stores assets and exposes convenience methods
 */
class ExchangerController extends BaseControllerV1<
  ExchangerConfig,
  ExchangerState
> {
  private mutex = new Mutex();

  private convertCoinToAsset;

  private getCurrentTokens;

  private txController;

  private preferencesController;

  private dextradeController: DextradeController;

  private readonly swapsController: SwapsController;

  private readonly tokensController: TokensController;

  private readonly chainsController: ChainsController;

  private isUnlocked: () => boolean;

  private stompClient?: CompatClient;

  private pingInterval?: ReturnType<typeof setTimeout>;

  private exchangeHistoryInterval?: ReturnType<typeof setTimeout>;

  private p2pActiveTransactionsInterval?: ReturnType<typeof setTimeout>;

  private exchangesQueue: Promise<any> = Promise.resolve(true);

  /**
   * Name of this controller used during composition
   */
  override name = 'ExchangerController';

  constructor({
    convertCoinToAsset,
    getCurrentTokens,
    isUnlocked,
    txController,
    preferencesController,
    tokensController,
    dextradeController,
    swapsController,
    chainsController,
    config,
    state,
  }: {
    getKeyringForAccount: (accountAddress: string) => Promise<any>;
    convertCoinToAsset: (coin: CoinModel) => Promise<AssetModel>;
    isUnlocked: () => boolean;
    getCurrentTokens: () => AssetModel[];
    txController: TransactionController;
    preferencesController: PreferencesController;
    tokensController: TokensController;
    dextradeController: DextradeController;
    swapsController: SwapsController;
    chainsController: ChainsController;
    config?: Partial<ExchangerConfig>;
    state?: Partial<ExchangerState>;
  }) {
    super(config, state);

    this.defaultConfig = {
      selectedAddress: '',
    };

    this.defaultState = {
      exchanger: null,
      exchangerStatus: ExchangerStatus.deactivated,
      exchangerReserves: [],
      exchangerHistory: [],
      allExchangers: {},
    };
    this.convertCoinToAsset = convertCoinToAsset;
    this.getCurrentTokens = getCurrentTokens;
    this.txController = txController;
    this.tokensController = tokensController;
    this.preferencesController = preferencesController;
    this.dextradeController = dextradeController;
    this.swapsController = swapsController;
    this.chainsController = chainsController;
    this.isUnlocked = isUnlocked;

    this.initialize();

    this.dextradeController.hub.on(
      'changed:api-key',
      ({ hasExchanger, startSocket }) => {
        if (hasExchanger && startSocket) {
          this.activate();
        }

        this.updateExchangerConfiguration();
        this.initPushNotifications();
      },
    );

    this.preferencesController.store.subscribe(
      previousValueComparator(async (prevState, currState) => {
        const { selectedAddress: prevSelectedAddress } = prevState;
        const { selectedAddress: currSelectedAddress } = currState;
        this.configure({ selectedAddress: currSelectedAddress });

        if (currSelectedAddress === prevSelectedAddress) {
          return;
        }

        const { allExchangers } = this.state;

        const {
          exchanger,
          exchangerHistory = [],
          exchangerReserves = [],
        } = allExchangers[currSelectedAddress] || {};
        this.update({
          exchanger,
          exchangerHistory,
          exchangerReserves,
        });
      }, this.preferencesController.store.getState()),
    );

    // setTimeout(() => {
    //   this.exc();
    // }, 5000);
  }

  clearAllIntervals() {
    clearInterval(this.exchangeHistoryInterval);
    clearInterval(this.p2pActiveTransactionsInterval);
    clearInterval(this.pingInterval);
  }

  stop() {
    this.clearAllIntervals();
  }

  start() {
    this.clearAllIntervals();

    this.exchangeHistoryInterval = setInterval(() => {
      this.refreshExchangerHistory();
    }, 3 * SECOND);
    this.p2pActiveTransactionsInterval = setInterval(() => {
      this.refreshActiveTransactions();
    }, 5 * SECOND);
  }

  async initPushNotifications() {
    const { mnemonicHash } = this.dextradeController.state;
    if (!mnemonicHash) {
      throw new Error('Mnemonic hash not found');
    }
    ///: BEGIN:ONLY_INCLUDE_IN(pwa)
    OneSignal.login(mnemonicHash);
    ///: END:ONLY_INCLUDE_IN
  }

  _getNewAllExchangers(exchangerState: any) {
    const { selectedAddress } = this.config;
    const { allExchangers, exchanger, exchangerHistory, exchangerReserves } =
      this.state;

    return {
      allExchangers: {
        ...allExchangers,
        [selectedAddress]: {
          exchanger,
          exchangerHistory,
          exchangerReserves,
          ...exchangerState,
        },
      },
    };
  }

  async connectSocket() {
    // this.stompClient?.disconnect();
    // this.stompClient = undefined;
    // const socket = new WebSocket('wss://api.dextrade.com/exchanges');
    // const stompClient = Stomp.over(socket);
    // stompClient.connect(
    //   {},
    //   () => {
    //     this.stompClient = stompClient;
    //     stompClient.subscribe(
    //       `/exchanges/transaction/${this.dextradeController.state.apiKey}`,
    //       (message) => {
    //         // const data = JSON.parse(message.body);
    //         // this.enqueueExchange(() => this.makeExchange(data));
    //       },
    //     );
    //     this.reconnectSocketAttempts = RECONNECT_SOCKET_ATTEMPTS;
    //   },
    //   () => {
    //     // error handling
    //   },
    //   () => {
    //     // close handling
    //     if (this.reconnectSocketAttempts > 0) {
    //       this.connectSocket();
    //       this.reconnectSocketAttempts -= 1;
    //     }
    //   },
    // );
  }

  exc() {
    const message = {
      id: 'cc87a139-300f-4685-87ab-b97710c2cda5',
      clientPaymentMethod: {
        userPaymentMethodId: 40,
        paymentMethod: {
          paymentMethodId: 51,
          name: 'RADABANK',
          fields: [
            {
              id: 104,
              contentType: 'FULL_NAME',
              fieldType: 'TEXT_FIELD',
              required: true,
              validate: false,
            },
            {
              id: 105,
              contentType: 'IBAN',
              fieldType: 'TEXT_FIELD',
              required: true,
              validate: false,
            },
          ],
        },
        currency: {
          id: 2,
          iso: 'BGN',
          name: 'Bulgarian lev',
        },
        data: '{"FULL_NAME:104":"123","IBAN:105":"213132"}',
      },
      exchangerPaymentMethod: {
        userPaymentMethodId: 37,
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
          id: 4,
          iso: 'CAD',
          name: 'Canadian dollar',
        },
        data: '{"ADDITIONAL_INFO_WITH_TITLE:111":"123","ADDITIONAL_INFO_WITH_TITLE:112":"123123"}',
      },
      exchangerId: 8,
      exchangerName: 'hastes',
      exchangerRating: 5,
      exchangerWalletAddress: 'TRUHAhF1zRqk9fRgHYEuzjzRd5S33gQ4aS',
      exchangerWalletAddressInNetwork2: '',
      exchangerTransactionStatus: 'PENDING',
      clientId: 10,
      clientTransactionStatus: 'PENDING',
      coinPair: {
        price: 1,
        priceCoin1InUsdt: 0.11135,
        priceCoin2InUsdt: 0.7252,
      },
      amount1: 1,
      amount2: 1,
      priceAdjustment: 0,
      status: 'WAIT_EXCHANGER_VERIFY',
      exchangerSettings: {
        id: 25,
        userId: 8,
        active: true,
        priceAdjustment: 0,
        walletAddress: 'TRUHAhF1zRqk9fRgHYEuzjzRd5S33gQ4aS',
        walletAddressInNetwork2: '',
        coinPair: {
          id: 9,
          pair: 'TRXAUD',
          nameFrom: 'TRX',
          nameTo: 'AUD',
          originalPrice: 1,
          price: 1,
          priceCoin1InUsdt: 0.11135,
          priceCoin2InUsdt: 0.7252,
          currencyAggregator: 'FIXED_PRICE',
        },
        from: {
          id: 8,
          ticker: 'TRX',
          tokenName: 'tron',
          uuid: 'tron',
          networkType: 'TRON',
          networkName: 'tron',
          networkId: 11,
        },
        to: {
          id: 13,
          ticker: 'AUD',
          tokenName: 'aud',
          uuid: 'aud',
          networkType: 'FIAT',
          networkName: 'fiat',
          networkId: 14,
        },
        reserve: {
          id: 49,
          coin: {
            id: 13,
            ticker: 'AUD',
            tokenName: 'aud',
            uuid: 'aud',
            networkType: 'FIAT',
            networkName: 'fiat',
            networkId: 14,
          },
          reserve: 10000,
          reservedAmount: 1,
        },
        priceCoin1InCoin2: 1,
        paymentMethod: {
          userPaymentMethodId: 37,
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
            id: 4,
            iso: 'CAD',
            name: 'Canadian dollar',
          },
          data: '{"ADDITIONAL_INFO_WITH_TITLE:111":"123","ADDITIONAL_INFO_WITH_TITLE:112":"123123"}',
        },
        statistic: {
          transactionCount: 2,
          amountInCoinFrom: 0,
          amountInCoinTo: 0,
        },
        canUpdate: true,
        cdt: 1712150828619,
      },
      statusHistory: [
        {
          id: 939,
          exchangeId: 'cc87a139-300f-4685-87ab-b97710c2cda5',
          status: 'WAIT_EXCHANGER_VERIFY',
          cdt: 1713253665752,
        },
      ],
      cdt: 1713253665751,
    };
    this.makeExchange(message);
  }

  async reserveExchange(data: any): Promise<any> {
    const releaseLock = await this.mutex.acquire();
    let localExchangerSetting;
    let txMeta;
    try {
      localExchangerSetting = this.state.exchanger?.exchangerSettings.find(
        (i) => i.id === data.exchangerSettings.id,
      );

      if (!localExchangerSetting?.isVerifiedByUser) {
        throw new Error(
          'reserve - SECURITY ERROR: exchangerSetting is not verified or not found in local db',
          data,
        );
      }

      if (!isSecureFieldsEqual(localExchangerSetting, data.exchangerSettings)) {
        throw new Error(
          'reserve - SECURITY ERROR: exchanger setting is not equal with local settings',
          data,
        );
      }

      const existsTransaction =
        this.txController.txStateManager.getTransactionByExchangeId(data.id);

      const exchangeRate = localExchangerSetting.coinPair.price;
      const reserveCoin = localExchangerSetting.reserve.coin;
      const fromCoin = localExchangerSetting.from;
      const destinationAddress = data.clientWalletAddress;
      const reserveAsset = await this.convertCoinToAsset(reserveCoin);
      const fromAsset = await this.convertCoinToAsset(fromCoin);
      if (existsTransaction) {
        return {
          txMeta: existsTransaction,
          fromAsset,
          reserveAsset,
          created: false,
        };
      }
      let sendSumInCoin2 = data.amount1 * exchangeRate; // 0.08 aud
      if (!reserveAsset.isFiat) {
        // if atomic swap no recalculate
        // fee = await this.txController.emulateTransaction(
        //   reserveAsset.getToken(),
        //   sendSumInCoin2, // TODO: sendSumInCoin2 > balance ? balance : sendSumInCoin2
        //   destinationAddress,
        // );
        // sendSumInCoin2 -= fee.feeNormalized;
      }

      sendSumInCoin2 -= data.transactionFee || 0;
      if (sendSumInCoin2 <= 0) {
        throw new Error(
          `makeExchange - Calculated total send amount is negative. Client should request more funds`,
        );
      }

      const { isAtomicSwap } = data.exchangerSettings;

      txMeta = await this.txController.createDextradeSwapTransaction(null, {
        from: {
          asset: reserveAsset,
          // amount: sendSumInCoin2,
          amount: data.amount2,
        },
        to: {
          amount: data.amount1,
          asset: fromAsset,
        },
        exchangerSettings: {
          exchangeId: data.id,
          exchangerName: data.exchangerName,
          reserved: sendSumInCoin2,
          clientPaymentMethod: data.clientPaymentMethod,
          exchangerPaymentMethod: data.exchangerPaymentMethod,
          exchangerSettingsId: localExchangerSetting.id,
          transactionFee: localExchangerSetting.transactionFee,
          hashLock: data.clientParams
            ? JSON.parse(data.clientParams).hashLock
            : null,
          expiration: isAtomicSwap
            ? BUILT_IN_NETWORKS[reserveAsset.chainId].atomicSwapExpiration
            : null,
        },
        receiveHash: data.clientTransactionHash,
        time: data.cdt,
        destinationAddress,
        exchangerType: ExchangerType.P2PExchanger,
      });

      // Confirm reserve funds
      if (!reserveAsset.isFiat) {
        const isReserveEnough =
          Number(reserveAsset.balance) >
          calcTokenAmount(sendSumInCoin2, reserveAsset.decimals).toNumber();

        if (isReserveEnough) {
          await this.dextradeController.api.reserveAccept(
            data.id,
            sendSumInCoin2,
          );
        } else {
          throw new Error('Reserve is not enough');
        }
      }
      return { txMeta, fromAsset, reserveAsset, created: true };
    } catch (err: any) {
      // TODO: Should save log error
      console.info('reserveExchange problem', err);
      this.dextradeController.api.reserveCancel(data.id);
      if (txMeta) {
        this.txController.txStateManager.setTxStatusFailed(txMeta.id, err);
      }
      throw err;
    } finally {
      releaseLock();
    }
  }

  #parseTxMeta(txMeta: TransactionMeta) {
    const fromAsset = this.txController.getAssetModelBackground(txMeta.source);
    const toAsset = this.txController.getAssetModelBackground(
      txMeta.destination,
    );
    const fromController =
      !fromAsset.isFiat &&
      this.chainsController.getControllerByChainId(fromAsset.chainId);
    const toController =
      !toAsset.isFiat &&
      this.chainsController.getControllerByChainId(toAsset.chainId);

    const isCryptoTrade = !fromAsset.isFiat && !toAsset.isFiat;
    return {
      fromAsset,
      fromController,
      toAsset,
      toController,
      isCryptoTrade,
    };
  }

  /* Claim safe of transaction */
  createClaimSafeTransaction(txMeta: TransactionMeta) {
    const { toController } = this.#parseTxMeta(txMeta);
    if (txMeta.hashLock) {
      throw new Error('No hashLock exists');
    }
    if (!txMeta.toSafe) {
      throw new Error('Safe to open does not exists');
    }
    const txParams = toController.generateClaimSafeParams({
      safeId: txMeta.toSafe?.id,
      hashLock: txMeta.hashLock,
    });

    this.txController.addApprovedTransaction(txParams, {
      actionId: String(`${txMeta.id}-claim`),
      method: 'eth_call',
      type: TransactionType.atomicSwapClaim,
    });
  }

  /* Claim safe of transaction */
  createRefundSafeTransaction(txMeta: TransactionMeta) {
    const { fromController } = this.#parseTxMeta(txMeta);
    if (!txMeta.fromSafe) {
      throw new Error('No safe to open exist');
    }
    const txParams = fromController.generateRefundSafeParams(
      txMeta.fromSafe.id,
    );
    const actionId = String(`${txMeta.id}-refund`);

    this.txController.addUnapprovedTransaction(
      'eth_call',
      txParams,
      ORIGIN_METAMASK,
      TransactionType.atomicSwapRefund,
      [],
      actionId,
    );
  }

  /**
   * Exchanger method for complete exchange
   * @param data - exchange data
   */
  async makeExchange(data: any) {
    const { txMeta, fromAsset, reserveAsset, created } =
      await this.reserveExchange(data);
    if (created && !reserveAsset.isFiat && !fromAsset.isFiat) {
      await this.txController.updateAndApproveTransaction(txMeta);
    }
  }

  async generateUpdateP2PExchangeExchanger(
    txMeta: TransactionMeta,
  ): Promise<TransactionMeta> {
    const exchange = await this.dextradeController.api
      .byId(txMeta.exchangerSettings.exchangeId)
      .catch((err: any) => {
        if (err.response?.status === 400) {
          txMeta.status = TransactionStatus.failed;
          txMeta.err = String(err);
        }
      });
    txMeta.receiveHash = exchange.clientTransactionHash;
    txMeta.exchangerSettings.status = exchange.status;
    txMeta.exchangerSettings.statistic = exchange.statistic;
    txMeta.exchangerSettings.priceAdjustment = exchange.priceAdjustment;
    txMeta.exchangerSettings.coinPair = exchange.exchangerSettings.coinPair;
    const { fromAsset, toAsset, fromController, toController, isCryptoTrade } =
      this.#parseTxMeta(txMeta);
    const isAtomicSwap = isCryptoTrade;

    if (isAtomicSwap) {
      const { hashLock } = JSON.parse(exchange.clientParams);
      txMeta.fromSafe = await fromController.readSafe({
        msgSender: exchange.exchangerWalletAddress,
        tokenAddress: fromAsset.contract,
        recipient: exchange.clientWalletAddress,
        amount: parseEther(
          String(txMeta.swapMetaData?.token_from_amount),
        ).toBigInt(),
        hashLock,
        expiration:
          BUILT_IN_NETWORKS[fromController.chainId].atomicSwapExpiration,
      });
      txMeta.toSafe = await toController.readSafe({
        msgSender: exchange.clientWalletAddress,
        tokenAddress: toAsset.contract,
        recipient: fromAsset.account,
        amount: parseEther(
          String(txMeta.swapMetaData?.token_to_amount),
        ).toBigInt(),
        hashLock,
        expiration:
          BUILT_IN_NETWORKS[toController.chainId].atomicSwapExpiration * 2n,
      });
      // check password into the safe that exchanger created for cleint
      txMeta.hashLock = txMeta.fromSafe?.data?.hashLock;
      // claim safe when client have opened safe
      if (
        txMeta.toSafe &&
        !txMeta.toSafe?.data?.claimed &&
        txMeta.hashLock &&
        txMeta.status !== TransactionStatus.confirmed
      ) {
        this.createClaimSafeTransaction(txMeta);
      }
      if (txMeta.toSafe?.data?.refunded || txMeta.fromSafe?.data?.refunded) {
        txMeta.status = TransactionStatus.failed;
      }
    }
    if (!isCryptoTrade) {
      const historyRow = exchange.statusHistory.find(
        ({ status }: { status: string }) =>
          status === ExchangeP2PStatus.waitExchangerTransfer,
      );
      txMeta.approveDeadline = historyRow ? historyRow.cdt + HOUR : null;
    }

    switch (txMeta.exchangerSettings.status) {
      case ExchangeP2PStatus.expired:
        txMeta.status = TransactionStatus.expired;
        break;
      case ExchangeP2PStatus.completed:
        if (!isAtomicSwap || (isAtomicSwap && txMeta.toSafe?.data?.claimed)) {
          txMeta.status = TransactionStatus.confirmed;
        }
        if (
          isAtomicSwap &&
          (txMeta.fromSafe?.data?.refunded || txMeta.toSafe?.data?.refunded)
        ) {
          txMeta.status = TransactionStatus.refunded;
        }
        break;
      case ExchangeP2PStatus.canceled:
        // canceled by client
        txMeta.status = TransactionStatus.rejected;
        break;
      case ExchangeP2PStatus.waitExchangerTransfer:
        if (txMeta.status !== TransactionStatus.submitted && isCryptoTrade) {
          // we can approve and create a new transaction when client created safe
          if (isAtomicSwap && txMeta.toSafe?.data) {
            await this.txController.updateAndApproveTransaction(txMeta);
          }
        }
        break;
      default:
    }
    return txMeta;
  }

  async generateUpdateP2PExchangeClient(
    txMeta: TransactionMeta,
  ): Promise<TransactionMeta> {
    const exchange = await this.dextradeController.api
      .byId(txMeta.exchangerSettings.exchangeId)
      .catch((err: any) => {
        if (err.response?.status === 400) {
          txMeta.status = TransactionStatus.failed;
          txMeta.err = String(err);
        }
      });
    txMeta.receiveHash = exchange.exchangerTransactionHash;
    txMeta.exchangerSettings.status = exchange.status;
    const fromAsset = this.txController.getAssetModelBackground(txMeta.source);
    if (fromAsset.isFiat) {
      const historyRow = exchange.statusHistory.find(
        ({ status }: { status: string }) => status === ExchangeP2PStatus.new,
      );
      if (historyRow) {
        txMeta.approveDeadline =
          historyRow.cdt +
          (exchange.exchangerSettings.timeToPay || 15 * MINUTE);
      }
    }

    switch (txMeta.exchangerSettings.status) {
      case ExchangeP2PStatus.new:
        if (!fromAsset.isFiat) {
          await this.txController.updateAndApproveTransaction(txMeta);
        }
        break;
      case ExchangeP2PStatus.canceled:
        txMeta.status = TransactionStatus.rejected;
        break;
      case ExchangeP2PStatus.completed:
        txMeta.status = TransactionStatus.confirmed;
        break;
      case ExchangeP2PStatus.expired:
        txMeta.status = TransactionStatus.expired;
        break;
      default:
    }
    return txMeta;
  }

  async generateUpdateOTCExchangerData(
    txMeta: TransactionMeta,
  ): Promise<TransactionMeta> {
    const pendingStatuses = [
      'wait',
      'confirmation',
      'confirmed',
      'exchanging',
      'sending',
    ];
    const successStatuses = ['success'];
    const failedStatuses = ['overdue', 'refunded'];

    const tx = {
      ...txMeta,
    };

    const id = tx.otc?.id;
    const provider = tx.otc?.provider;

    if (!id || !provider) {
      throw new Error('[OTC] params error');
    }

    const exchange = this.swapsController.otcController.getById(id, provider);
    tx.p2p.clientTransactionHash = exchange.hashIn.hash;
    tx.p2p.exchangerTransactionHash = exchange.hashOut.hash;
    tx.otc.status = exchange.status;
    // txMeta.swapMetaData.token_to_amount = exchange.amount2;

    switch (true) {
      case pendingStatuses.includes(exchange.status):
        tx.status = TransactionStatus.pending;
        break;
      case successStatuses.includes(exchange.status):
        tx.p2p.status = ExchangeStatuses.confirmed;
        tx.status = TransactionStatus.confirmed;
        break;
      case failedStatuses.includes(exchange.status):
        tx.p2p.status = ExchangeStatuses.canceled;
        tx.status = TransactionStatus.rejected;
        break;
      default:
        tx.p2p.status = '';
    }
    return tx;
  }

  async refreshActiveTransactions() {
    if (
      this.state.exchanger &&
      this.state.exchangerStatus === ExchangerStatus.active
    ) {
      this.dextradeController.api
        .request('POST', 'api/exchange/filter', {
          includedStatuses: [
            ExchangeP2PStatus.new,
            ExchangeP2PStatus.waitExchangerVerify,
            ExchangeP2PStatus.waitExchangerTransfer,
          ],
          isExchanger: true,
          orderBy: 'BY_DATE',
          sort: 'DESC',
          page: 1,
          size: 10,
        })
        .then((exchanges: any[]) => {
          exchanges
            .filter(
              ({ exchangerId }: any) =>
                exchangerId === this.state.exchanger?.id,
            )
            .forEach((item: any) => {
              this.reserveExchange(item);
            });
        });
    }
  }

  async refreshExchangerHistory() {
    /**
     * После транзакции создается запись в активити, нужно получать историю с бека
     * и записи истории добавлять к активити по id обмена,
     *
     * эксчендер создает "активити сущность" добавляет туда id обмена
     * клиент создает "активити сущность" добавляет туда id обмена
     *
     * контроллер сопоставитель сопостовляет историю с активити
     *
     */

    const awaitingSwapTransactions =
      this.txController.txStateManager.getAwaitingSwapTransactions();
    if (!this.isUnlocked() || !awaitingSwapTransactions.length) {
      return;
    }

    const generators = {
      [ExchangerType.P2PClient]:
        this.generateUpdateP2PExchangeClient.bind(this),
      [ExchangerType.P2PExchanger]:
        this.generateUpdateP2PExchangeExchanger.bind(this),
      [ExchangerType.OTC]: this.generateUpdateOTCExchangerData.bind(this),
      [ExchangerType.DEX]: null,
    };

    const txMetas = await Promise.allSettled(
      awaitingSwapTransactions.map(
        async (txMeta: TransactionMeta): Promise<TransactionMeta> => {
          const { exchangerType } = txMeta;

          const generateUpdatedTxData =
            exchangerType && generators[exchangerType];

          if (!generateUpdatedTxData) {
            throw new Error('Exchange type transaction is unrecognized');
          }

          return generateUpdatedTxData(txMeta);
        },
      ),
    );

    txMetas
      .filter((p) => p.status === 'fulfilled')
      .map((p) => p.value)
      .forEach((txMeta: TransactionMeta) => {
        this.txController.updateTransaction(txMeta);
      });
  }

  async updateExchangerConfiguration() {
    try {
      const { exchangerSettings } = await this.p2pLoadExchanger();
      exchangerSettings.forEach((item: any) => {
        const addToken = (token: any) =>
          this.convertCoinToAsset(token).then((v) =>
            this.tokensController.addToken(v.getToken()),
          );
        if (item.from.networkName !== NetworkNames.fiat) {
          addToken(item.from);
        }
        if (item.to.networkName !== NetworkNames.fiat) {
          addToken(item.to);
        }
      });
    } catch (e: any) {
      if (e.code === 404) {
        const params = {
          exchanger: null,
        };
        this.update({
          ...params,
          ...this._getNewAllExchangers(params),
        });
      } else {
        this.deactivate();
      }
    }
  }

  repeatExchange(exchangeData: any) {
    return this.makeExchange(exchangeData);
  }

  async setActive(active: boolean) {
    if (active) {
      await this.activate();
    } else {
      await this.deactivate();
    }
    await this.updateExchangerConfiguration();
  }

  async setActiveDirection(directionId: number, active: boolean) {
    await this.dextradeController.api.request('POST', 'api/exchanger/status', {
      active,
      id: directionId,
    });
    return this.updateExchangerConfiguration();
  }

  async userConfirmDirection(directionId: number) {
    const currentExchanger = this.state.exchanger;
    if (!currentExchanger) {
      throw new Error('Exchanger is not initialized');
    }
    const direction = currentExchanger?.exchangerSettings.find(
      (i) => i.id === directionId,
    );
    if (!direction) {
      throw new Error(`Direction with id ${directionId} not found`);
    }
    direction.isVerifiedByUser = true;
    const params = {
      exchanger: {
        ...currentExchanger,
      },
    };
    this.update({
      ...params,
      ...this._getNewAllExchangers(params),
    });
    if (!direction.active) {
      await this.setActiveDirection(directionId, true);
    }
  }

  async exchangerSettingRemove(id: number) {
    await this.dextradeController.api.request(
      'POST',
      'api/exchanger/delete/setting',
      {
        id,
      },
    );
    return this.updateExchangerConfiguration();
  }

  async activate() {
    this.update({
      exchangerStatus: ExchangerStatus.active,
    });
    await this.dextradeController.api.request(
      'POST',
      'api/user/activate',
      null,
      {
        force: true,
      },
    );
    this.pingInterval = setInterval(() => {
      this.ping();
      this.updateExchangerConfiguration();
    }, MINUTE * 3);
    await this.ping();
    this.connectSocket();
  }

  async deactivate() {
    if (this.state.exchangerStatus !== ExchangerStatus.active) {
      return null;
    }
    this.update({
      exchangerStatus: ExchangerStatus.deactivated,
    });
    this.stompClient?.disconnect();
    clearInterval(this.pingInterval);
    return this.dextradeController.api.request('POST', 'api/user/offline');
  }

  ping() {
    return this.dextradeController.api.request('POST', 'api/user/ping');
  }

  async p2pLoadReserves() {
    const exchangerReserves = await this.dextradeController.api.request(
      'GET',
      'api/exchanger/reserve',
    );
    const params = {
      exchangerReserves,
    };
    this.update({
      ...params,
      ...this._getNewAllExchangers(params),
    });
  }

  // @deprecated
  async p2pCommitReserves() {
    // const serializedReserves = reserves.map((reserve) => {
    //   return {
    //     // Id can be generated by uuidv4 algorythm for indexing purposes
    //     id: Number.isInteger(Number(reserve.id)) ? reserve.id : undefined,
    //     coin: new AssetModel(reserve.asset).getCoin(),
    //     reserve: reserve.amount,
    //     walletAddress: reserve.walletAddress,
    //   };
    // });
    // await this.dextradeController.api.request(
    //   'POST',
    //   'api/exchanger/reserve/list',
    //   serializedReserves,
    // );
    // return this.p2pLoadReserves();
  }

  async syncTokenReserves() {
    if (!this.dextradeController.isAuthenticated) {
      return null;
    }
    const SUPPORTED_NETWORKS = [
      'binance_smart_chain',
      'ethereum',
      'bitcoin',
      'fiat',
      'tron',
      'sepolia',
    ];
    const { exchangerReserves } = this.state;
    let restUserTokens = this.getCurrentTokens().filter(
      ({ network, balance }) =>
        balance && Number(balance) > 0 && SUPPORTED_NETWORKS.includes(network),
    );
    const existsReserves = exchangerReserves.reduce(
      (acc, { id, coin, walletAddress }) => {
        const asset = restUserTokens.find(
          (userToken) =>
            userToken.network === coin.networkName &&
            userToken.symbol === coin.ticker,
        );
        if (asset) {
          restUserTokens = restUserTokens.filter(
            (userToken) => userToken !== asset,
          );
          return [
            ...acc,
            {
              id,
              coin: asset.getCoin(),
              walletAddress,
              reserve: calcTokenAmount(
                asset.balance,
                asset.decimals,
              ).toString(),
            },
          ];
        }
        return acc;
      },
      [],
    );
    const nonExistReserves = restUserTokens.map((asset) => ({
      coin: asset.getCoin(),
      reserve: calcTokenAmount(asset.balance, asset.decimals).toString(),
      walletAddress: asset.getAccount(),
    }));

    await this.dextradeController.api.request(
      'POST',
      'api/exchanger/reserve/list',
      { reserves: [...existsReserves, ...nonExistReserves] },
    );
    return this.p2pLoadReserves();
  }

  async p2pCommitReservesSettings(newDirection: ExchangerDirection) {
    const result = await this.dextradeController.api.request(
      'POST',
      'api/exchanger/save/settings',
      newDirection,
    );
    newDirection.id = result.id;

    const { exchanger } = this.state;
    if (!exchanger) {
      throw new Error('Exchanger is not created yet');
    }

    const exchangerSettings = exchanger.exchangerSettings.filter(
      (i) => i.id !== newDirection.id,
    );

    const newExchangerSettings = [...exchangerSettings, newDirection];
    const params = {
      exchanger: {
        ...exchanger,
        exchangerSettings: newExchangerSettings,
      },
    };
    this.update({
      ...params,
      ...this._getNewAllExchangers(params),
    });
    // return this.p2pLoadExchanger();
  }

  async removeReserveSetting(id: number) {
    await this.dextradeController.api.request(
      'DELETE',
      'api/exchanger/delete/setting',
      null,
      { id },
    );
    return this.p2pLoadExchanger();
  }

  async rejectExchange(exchangeId: string) {
    await this.dextradeController.api.request(
      'POST',
      'api/exchange/exchanger/cancel/transaction',
      { id: exchangeId },
    );
    this.rejectTx(exchangeId);
  }

  /**
   * Reserves or cancel P2P transaction, using for crypto-fiat manual confirmations for exchanger.
   * @param reserve
   * @param reserve.id
   * @param reserve.amount
   * @param reserve.isConfirmed
   */
  async reserve(reserve: { id: string; amount: number; isConfirmed: boolean }) {
    await this.dextradeController.api.request(
      'POST',
      'api/exchange/exchanger/verify/reserve',
      {
        reserves: [reserve],
      },
    );
    if (reserve.isConfirmed === false) {
      this.rejectTx(reserve.id);
    }
  }

  rejectTx(exchangeId: string) {
    const existsTransaction =
      this.txController.txStateManager.getTransactionByExchangeId(exchangeId);
    this.txController.txStateManager.setTxStatusRejected(
      existsTransaction.id,
      false,
    );
  }

  async p2pExchangesExchangerCreate({ name }: { name: string }) {
    await this.dextradeController.api.exchangerCreate({
      name,
    });
    this.syncTokenReserves();
    return this.p2pLoadExchanger();
  }

  async p2pLoadExchanger() {
    const exchanger =
      (await this.dextradeController.api.exchangerCurrentUser()) as Exchanger;

    const { exchangerSettings: prevDirections } = this.state.exchanger || {
      exchangerSettings: [],
    };
    exchanger.exchangerSettings.forEach((newDirection) => {
      const prevDirection = prevDirections.find(
        (i) => i.id === newDirection.id,
      ) || { isVerifiedByUser: false };
      const isEqualFields = isSecureFieldsEqual(prevDirection, newDirection);
      if (prevDirection.isVerifiedByUser && isEqualFields) {
        newDirection.isVerifiedByUser = true;
      } else {
        newDirection.isVerifiedByUser = false;
      }
    });

    const params = {
      exchanger,
    };
    this.update({
      ...params,
      ...this._getNewAllExchangers(params),
    });
    return exchanger;
  }
}

export default ExchangerController;
