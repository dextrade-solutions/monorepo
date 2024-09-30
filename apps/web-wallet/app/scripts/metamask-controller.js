import EventEmitter from 'events';
import pump from 'pump';

import { JsonRpcEngine } from 'json-rpc-engine';
import { createEngineStream } from 'json-rpc-middleware-stream';
import { debounce } from 'lodash';
// eslint-disable-next-line camelcase

import createFilterMiddleware from 'eth-json-rpc-filters';
import createSubscriptionManager from 'eth-json-rpc-filters/subscriptionManager';
import { errorCodes as rpcErrorCodes, EthereumRpcError } from 'eth-rpc-errors';
import { Mutex } from 'await-semaphore';
import log from 'loglevel';
import TrezorKeyring from 'eth-trezor-keyring';
import LedgerBridgeKeyring from '@metamask/eth-ledger-bridge-keyring';
import LatticeKeyring from 'eth-lattice-keyring';
// import { MetaMaskKeyring as QRHardwareKeyring } from '@keystonehq/metamask-airgapped-keyring';
import nanoid from 'nanoid';
import { captureException } from '@sentry/browser';
import { AddressBookController } from '@metamask/address-book-controller';
import { providerAsMiddleware } from '@metamask/eth-json-rpc-middleware';
import {
  ApprovalController,
  ApprovalRequestNotFoundError,
} from '@metamask/approval-controller';
import { ControllerMessenger } from '@metamask/base-controller';
import { PhishingController } from '@metamask/phishing-controller';
import { AnnouncementController } from '@metamask/announcement-controller';
import {
  PermissionController,
  PermissionsRequestNotFoundError,
} from '@metamask/permission-controller';
import {
  SubjectMetadataController,
  SubjectType,
} from '@metamask/subject-metadata-controller';
import { NotificationController } from '@metamask/notification-controller';

///: BEGIN:ONLY_INCLUDE_IN(flask)
// import { RateLimitController } from '@metamask/rate-limit-controller';
///: END:ONLY_INCLUDE_IN
///: BEGIN:ONLY_INCLUDE_IN(flask)
// import {
//   CronjobController,
//   SnapController,
//   IframeExecutionService,
// } from '@metamask/snaps-controllers';
///: END:ONLY_INCLUDE_IN

import browser from 'webextension-polyfill';
import { TransactionStatus } from '../../shared/constants/transaction';
import { HardwareDeviceNames } from '../../shared/constants/hardware-wallets';
import { KeyringType } from '../../shared/constants/keyring';
import {
  CaveatTypes,
  RestrictedMethods,
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  // EndowmentPermissions,
  // ExcludedSnapPermissions,
  // ExcludedSnapEndowments,
  ///: END:ONLY_INCLUDE_IN
} from '../../shared/constants/permissions';
import { UI_NOTIFICATIONS } from '../../shared/notifications';
import {
  toChecksumHexAddress,
  stripHexPrefix,
} from '../../shared/modules/hexstring-utils';
import { MILLISECOND, SECOND } from '../../shared/constants/time';
import {
  ORIGIN_METAMASK,
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  // MESSAGE_TYPE,
  // SNAP_DIALOG_TYPES,
  ///: END:ONLY_INCLUDE_IN
  POLLING_TOKEN_ENVIRONMENT_TYPES,
} from '../../shared/constants/app';
import { EVENT, EVENT_NAMES } from '../../shared/constants/metametrics';

import { fetchTokensRegistry } from '../../shared/lib/token-util';

import {
  CurrencyRateController,
  TokensController,
  AssetBalancesController,
} from '../overrided-metamask/assets-controllers';
import { GasFeeController } from '../overrided-metamask/gas-fee-controller';

import {
  keyringBuilderFactory,
  KeyringController,
} from '../overrided-metamask/eth-keyring-controller';

import { STATIC_MAINNET_TOKEN_LIST } from '../../shared/constants/tokens';
import { isManifestV3 } from '../../shared/modules/mv3.utils';
import { hexToDecimal } from '../../shared/modules/conversion.utils';

///: BEGIN:ONLY_INCLUDE_IN(flask)
// import { isMain, isFlask } from '../../shared/constants/environment';
// eslint-disable-next-line import/order
// import { DesktopController } from '@metamask/desktop/dist/controllers/desktop';
///: END:ONLY_INCLUDE_IN
import { NetworkNames } from '../../shared/constants/exchanger';
import { AssetModel } from '../../shared/lib/asset-model';
import { getSharedProvider } from '../../shared/shared-chain-provider';
import { CHAIN_ID_TO_NETWORK_MAP } from '../../shared/constants/network';
import ComposableObservableStore from './lib/ComposableObservableStore';
import createDupeReqFilterMiddleware from './lib/createDupeReqFilterMiddleware';
import createLoggerMiddleware from './lib/createLoggerMiddleware';
import {
  createMethodMiddleware,
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  // createSnapMethodMiddleware,
  ///: END:ONLY_INCLUDE_IN
} from './lib/rpc-method-middleware';
import createOriginMiddleware from './lib/createOriginMiddleware';
import createTabIdMiddleware from './lib/createTabIdMiddleware';
import createOnboardingMiddleware from './lib/createOnboardingMiddleware';
import { setupMultiplex } from './lib/stream-utils';
import NetworkController, { NETWORK_EVENTS } from './controllers/network';
import PreferencesController from './controllers/preferences';
import AppStateController from './controllers/app-state';
import AlertController from './controllers/alert';
import OnboardingController from './controllers/onboarding';
import BackupController from './controllers/backup';
import DecryptMessageManager from './lib/decrypt-message-manager';
import EncryptionPublicKeyManager from './lib/encryption-public-key-manager';
import TransactionController from './controllers/transactions';
import DetectTokensController from './controllers/detect-tokens';
import SwapsController from './controllers/swaps';
import accountImporter from './account-import-strategies';
import seedPhraseVerifier from './lib/seed-phrase-verifier';
import MetaMetricsController from './controllers/metametrics';
import { segment } from './lib/segment';
import createMetaRPCHandler from './lib/createMetaRPCHandler';
import { previousValueComparator } from './lib/util';
import createMetamaskMiddleware from './lib/createMetamaskMiddleware';
import SignController from './controllers/sign';
import ChainsController from './controllers/chains-controller';

import {
  CaveatMutatorFactories,
  getCaveatSpecifications,
  getChangedAccounts,
  getPermissionBackgroundApiMethods,
  getPermissionSpecifications,
  getPermittedAccountsByOrigin,
  NOTIFICATION_NAMES,
  PermissionLogController,
  unrestrictedMethods,
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  // buildSnapEndowmentSpecifications,
  // buildSnapRestrictedMethodSpecifications,
  ///: END:ONLY_INCLUDE_IN
} from './controllers/permissions';
import createRPCMethodTrackingMiddleware from './lib/createRPCMethodTrackingMiddleware';
import { securityProviderCheck } from './lib/security-provider-helpers';
import ExchangerController from './controllers/exchanger';
import MultisignerController from './controllers/multisigner/multisigner-controller';
import WalletConnectController from './controllers/wallet-connect';
import generateMnemonicHash from './lib/generate-mnemonic-hash';
import DextradeController from './controllers/dextrade';

export const METAMASK_CONTROLLER_EVENTS = {
  // Fired after state changes that impact the extension badge (unapproved msg count)
  // The process of updating the badge happens in app/scripts/background.js.
  UPDATE_BADGE: 'updateBadge',
  // TODO: Add this and similar enums to the `controllers` repo and export them
  APPROVAL_STATE_CHANGE: 'ApprovalController:stateChange',
};

// stream channels
const PHISHING_SAFELIST = 'metamask-phishing-safelist';

export default class MetamaskController extends EventEmitter {
  /**
   * @param {object} opts
   */
  constructor(opts) {
    super();

    this.defaultMaxListeners = 20;

    this.sendUpdate = debounce(
      this.privateSendUpdate.bind(this),
      MILLISECOND * 200,
    );
    this.opts = opts;
    this.extension = opts.browser;
    this.platform = opts.platform;
    this.notificationManager = opts.notificationManager;
    const initState = opts.initState || {};
    const version = this.platform.getVersion();
    this.recordFirstTimeInfo(initState);

    // this keeps track of how many "controllerStream" connections are open
    // the only thing that uses controller connections are open metamask UI instances
    this.activeControllerConnections = 0;

    this.getRequestAccountTabIds = opts.getRequestAccountTabIds;
    this.getOpenMetamaskTabsIds = opts.getOpenMetamaskTabsIds;

    this.controllerMessenger = new ControllerMessenger();

    // instance of a class that wraps the extension's storage local API.
    this.localStoreApiWrapper = opts.localStore;

    // observable state store
    this.store = new ComposableObservableStore({
      state: initState,
      controllerMessenger: this.controllerMessenger,
      persist: true,
    });

    // external connections by origin
    // Do not modify directly. Use the associated methods.
    this.connections = {};

    // lock to ensure only one vault created at once
    this.createVaultMutex = new Mutex();

    // this.extension.runtime.onInstalled.addListener((details) => {
    //   if (details.reason === 'update' && version === '8.1.0') {
    //     this.platform.openExtensionInBrowser();
    //   }
    // });

    // next, we will initialize the controllers
    // controller initialization order matters

    this.approvalController = new ApprovalController({
      messenger: this.controllerMessenger.getRestricted({
        name: 'ApprovalController',
      }),
      showApprovalRequest: () => this.showUserConfirmation(),
    });

    this.networkController = new NetworkController({
      state: initState.NetworkController,
      infuraProjectId: opts.infuraProjectId,
      trackMetaMetricsEvent: (...args) =>
        this.metaMetricsController.trackEvent(...args),
    });
    // const tokenListMessenger = this.controllerMessenger.getRestricted({
    //   name: 'TokenListController',
    // });

    // this.tokenListController = new TokenListController({
    //   chainId: hexToDecimal(
    //     this.networkController.store.getState().provider.chainId,
    //   ),
    //   preventPollingOnNetworkRestart: initState.TokenListController
    //     ? initState.TokenListController.preventPollingOnNetworkRestart
    //     : true,
    //   // onNetworkStateChange: (cb) => {
    //   //   this.networkController.store.subscribe((networkState) => {
    //   //     const modifiedNetworkState = {
    //   //       ...networkState,
    //   //       providerConfig: {
    //   //         ...networkState.provider,
    //   //         chainId: hexToDecimal(networkState.provider.chainId),
    //   //       },
    //   //     };
    //   //     return cb(modifiedNetworkState);
    //   //   });
    //   // },
    //   messenger: tokenListMessenger,
    //   state: initState.TokenListController,
    // });
    this.preferencesController = new PreferencesController({
      initState: initState.PreferencesController,
      initLangCode: opts.initLangCode,
      openPopup: opts.openPopup,
      network: this.networkController,
    });

    this.onboardingController = new OnboardingController({
      initState: initState.OnboardingController,
    });

    let additionalKeyrings = [];

    if (this.canUseHardwareWallets()) {
      const keyringOverrides = this.opts.overrides?.keyrings;

      const additionalKeyringTypes = [
        keyringOverrides?.trezor || TrezorKeyring,
        keyringOverrides?.ledger || LedgerBridgeKeyring,
        keyringOverrides?.lattice || LatticeKeyring,
      ];
      additionalKeyrings = additionalKeyringTypes.map((keyringType) =>
        keyringBuilderFactory(keyringType),
      );
    }

    this.keyringController = new KeyringController({
      keyringBuilders: additionalKeyrings,
      initState: initState.KeyringController,
      encryptor: opts.encryptor || undefined,
      cacheEncryptionKey: isManifestV3,
    });

    this.keyringController.memStore.subscribe((state) =>
      this._onKeyringControllerUpdate(state),
    );
    this.keyringController.on('unlock', () => this._onUnlock());
    this.keyringController.on('lock', () => this._onLock());

    this.dextradeController = new DextradeController({
      messenger: this.controllerMessenger.getRestricted({
        name: 'DextradeController',
      }),
      getCurrentKeyring: this.getCurrentKeyring.bind(this),
      platform: this.platform,
      keyringController: this.keyringController,
      state: initState.DextradeController,
    });

    this.chainsController = new ChainsController({
      state: initState.ChainsController,
      preferencesController: this.preferencesController,
      onboardingController: this.onboardingController,
      keyringController: this.keyringController,
      deriveHdKey: this.deriveHdKey.bind(this),
      initActiveChainsTokens: this.initActiveChainsTokens.bind(this),
    });

    this.tokensController = new TokensController({
      chainsController: this.chainsController,
      onPreferencesStateChange: this.preferencesController.store.subscribe.bind(
        this.preferencesController.store,
      ),
      config: {
        selectedAddress: this.preferencesController.getSelectedAddress(),
      },
      state: initState.TokensController,
    });

    this.metaMetricsController = new MetaMetricsController({
      segment,
      preferencesStore: this.preferencesController.store,
      onNetworkDidChange: this.networkController.on.bind(
        this.networkController,
        NETWORK_EVENTS.NETWORK_DID_CHANGE,
      ),
      getNetworkIdentifier: () => {
        return 'mainnet';
      },
      getCurrentChainId: () => '0x1',
      version: this.platform.getVersion(),
      environment: process.env.METAMASK_ENVIRONMENT,
      extension: this.extension,
      initState: initState.MetaMetricsController,
      captureException,
    });

    this.on('update', (update) => {
      this.metaMetricsController.handleMetaMaskStateUpdate(update);
    });

    const gasFeeMessenger = this.controllerMessenger.getRestricted({
      name: 'GasFeeController',
    });
    this.gasFeeController = new GasFeeController({
      state: initState.GasFeeController,
      chainsController: this.chainsController,
      interval: 10000,
      messenger: gasFeeMessenger,
    });

    // this.qrHardwareKeyring = new QRHardwareKeyring();

    this.appStateController = new AppStateController({
      addUnlockListener: this.on.bind(this, 'unlock'),
      isUnlocked: this.isUnlocked.bind(this),
      initState: initState.AppStateController,
      onInactiveTimeout: () => this.setLocked(),
      showUnlockRequest: () => this.showUserConfirmation(),
      preferencesStore: this.preferencesController.store,
      // qrHardwareStore: this.qrHardwareKeyring.getMemStore(),
    });

    const currencyRateMessenger = this.controllerMessenger.getRestricted({
      name: 'CurrencyRateController',
    });
    this.currencyRateController = new CurrencyRateController({
      getTokens: () => this.tokensController.state.tokens,
      includeUsdRate: true,
      messenger: currencyRateMessenger,
      state: initState.CurrencyController,
    });

    this.phishingController = new PhishingController(
      {},
      initState.PhishingController,
    );

    this.phishingController.maybeUpdateState();

    if (process.env.IN_TEST) {
      this.phishingController.setHotlistRefreshInterval(5 * SECOND);
      this.phishingController.setStalelistRefreshInterval(30 * SECOND);
    }

    this.announcementController = new AnnouncementController({
      messenger: this.controllerMessenger.getRestricted({
        name: 'AnnouncementController',
      }),
      allAnnouncements: UI_NOTIFICATIONS,
      state: initState.AnnouncementController,
    });

    this.preferencesController.store.subscribe(
      previousValueComparator((prevState, currState) => {
        const { useCurrencyRateCheck: prevUseCurrencyRateCheck } = prevState;
        const { useCurrencyRateCheck: currUseCurrencyRateCheck } = currState;
        if (currUseCurrencyRateCheck && !prevUseCurrencyRateCheck) {
          this.currencyRateController.start();
          // this.tokenRatesController.configure(
          //   { disabled: false },
          //   false,
          //   false,
          // );
        } else if (!currUseCurrencyRateCheck && prevUseCurrencyRateCheck) {
          this.currencyRateController.stop();
          // this.tokenRatesController.configure({ disabled: true }, false, false);
        }
      }, this.preferencesController.store.getState()),
    );

    // this.ensController = new EnsController({
    //   // provider: this.provider,
    //   getCurrentChainId: () =>
    //     this.networkController.store.getState().provider.chainId,
    //   onNetworkDidChange: this.networkController.on.bind(
    //     this.networkController,
    //     NETWORK_EVENTS.NETWORK_DID_CHANGE,
    //   ),
    // });

    // account tracker watches balances, nonces, and any code at their address
    // deprecated in Dextrade, may be will moved in chains controller
    // this.accountTracker = new AccountTracker({
    //   provider: this.provider,
    //   blockTracker: this.blockTracker,
    //   getCurrentChainId: () =>
    //     this.networkController.store.getState().provider.chainId,
    //   getNetworkIdentifier: () => {
    //     const { type, rpcUrl } =
    //       this.networkController.store.getState().provider;
    //     return type === NETWORK_TYPES.RPC ? rpcUrl : type;
    //   },
    //   preferencesController: this.preferencesController,
    //   onboardingController: this.onboardingController,
    // });

    // start and stop polling for balances based on activeControllerConnections
    this.on('controllerConnectionChanged', (activeControllerConnections) => {
      const { completedOnboarding } =
        this.onboardingController.store.getState();
      if (activeControllerConnections > 0 && completedOnboarding) {
        this.triggerNetworkrequests();
      } else {
        this.stopNetworkRequests();
      }
    });

    this.onboardingController.store.subscribe(
      previousValueComparator(async (prevState, currState) => {
        const { completedOnboarding: prevCompletedOnboarding } = prevState;
        const { completedOnboarding: currCompletedOnboarding } = currState;
        if (!prevCompletedOnboarding && currCompletedOnboarding) {
          this.triggerNetworkrequests();
        }
      }, this.onboardingController.store.getState()),
    );

    // this.cachedBalancesController = new CachedBalancesController({
    //   accountTracker: this.accountTracker,
    //   getCurrentChainId: () =>
    //     this.networkController.store.getState().provider.chainId,
    //   initState: initState.CachedBalancesController,
    // });

    // token exchange rate tracker
    // this.tokenRatesController = new TokenRatesController(
    //   {
    //     onTokensStateChange: (listener) =>
    //       this.tokensController.subscribe(listener),
    //     onCurrencyRateStateChange: (listener) =>
    //       this.controllerMessenger.subscribe(
    //         `${this.currencyRateController.name}:stateChange`,
    //         listener,
    //       ),
    //     onNetworkStateChange: (cb) =>
    //       this.networkController.store.subscribe((networkState) => {
    //         const modifiedNetworkState = {
    //           ...networkState,
    //           providerConfig: {
    //             ...networkState.provider,
    //             chainId: hexToDecimal(networkState.provider.chainId),
    //           },
    //         };
    //         return cb(modifiedNetworkState);
    //       }),
    //   },
    //   {
    //     disabled:
    //       !this.preferencesController.store.getState().useCurrencyRateCheck,
    //   },
    //   initState.TokenRatesController,
    // );

    const getIdentities = () =>
      this.preferencesController.store.getState().identities;

    this.permissionController = new PermissionController({
      messenger: this.controllerMessenger.getRestricted({
        name: 'PermissionController',
        allowedActions: [
          `${this.approvalController.name}:addRequest`,
          `${this.approvalController.name}:hasRequest`,
          `${this.approvalController.name}:acceptRequest`,
          `${this.approvalController.name}:rejectRequest`,
        ],
      }),
      state: initState.PermissionController,
      caveatSpecifications: getCaveatSpecifications({ getIdentities }),
      permissionSpecifications: {
        ...getPermissionSpecifications({
          getIdentities,
          getAllAccounts: this.keyringController.getAccounts.bind(
            this.keyringController,
          ),
          captureKeyringTypesWithMissingIdentities: (
            identities = {},
            accounts = [],
          ) => {
            const accountsMissingIdentities = accounts.filter(
              (address) => !identities[address],
            );
            const keyringTypesWithMissingIdentities =
              accountsMissingIdentities.map(
                (address) =>
                  this.keyringController.getKeyringForAccount(address)?.type,
              );

            const identitiesCount = Object.keys(identities || {}).length;

            const accountTrackerCount = Object.keys(
              this.accountTracker.store.getState().accounts || {},
            ).length;

            captureException(
              new Error(
                `Attempt to get permission specifications failed because their were ${accounts.length} accounts, but ${identitiesCount} identities, and the ${keyringTypesWithMissingIdentities} keyrings included accounts with missing identities. Meanwhile, there are ${accountTrackerCount} accounts in the account tracker.`,
              ),
            );
          },
        }),
        ///: BEGIN:ONLY_INCLUDE_IN(flask)
        // ...this.getSnapPermissionSpecifications(),
        ///: END:ONLY_INCLUDE_IN
      },
      unrestrictedMethods,
    });

    this.permissionLogController = new PermissionLogController({
      restrictedMethods: new Set(Object.keys(RestrictedMethods)),
      initState: initState.PermissionLogController,
    });

    this.subjectMetadataController = new SubjectMetadataController({
      messenger: this.controllerMessenger.getRestricted({
        name: 'SubjectMetadataController',
        allowedActions: [`${this.permissionController.name}:hasPermissions`],
      }),
      state: initState.SubjectMetadataController,
      subjectCacheLimit: 100,
    });

    this.notificationController = new NotificationController({
      messenger: this.controllerMessenger.getRestricted({
        name: 'NotificationController',
      }),
      state: initState.NotificationController,
    });

    this.detectTokensController = new DetectTokensController({
      preferences: this.preferencesController,
      tokensController: this.tokensController,
      network: this.networkController,
      keyringMemStore: this.keyringController.memStore,
      trackMetaMetricsEvent: this.metaMetricsController.trackEvent.bind(
        this.metaMetricsController,
      ),
    });

    this.addressBookController = new AddressBookController(
      undefined,
      initState.AddressBookController,
    );

    this.alertController = new AlertController({
      initState: initState.AlertController,
      preferencesStore: this.preferencesController.store,
    });

    this.backupController = new BackupController({
      preferencesController: this.preferencesController,
      addressBookController: this.addressBookController,
      networkController: this.networkController,
      trackMetaMetricsEvent: this.metaMetricsController.trackEvent.bind(
        this.metaMetricsController,
      ),
    });

    this.swapsController = new SwapsController({
      networkController: this.networkController,
      dextradeController: this.dextradeController,
      getEIP1559GasFeeEstimates:
        this.gasFeeController.fetchGasFeeEstimates.bind(this.gasFeeController),
      getApiKey: () => this.exchangerController.state.exchangerApiKey,
      //
      preferencesController: this.preferencesController,
      keyringController: this.keyringController,
      chainsController: this.chainsController,
      deriveHdKey: this.deriveHdKey.bind(this),
      getSelectedAddress: () =>
        this.preferencesController.store.getState().selectedAddress,
      getTxController: () => this.txController,
    });

    this.txController = new TransactionController({
      initState:
        initState.TransactionController || initState.TransactionManager,
      getAssetModelBackground: this.getAssetModelBackground.bind(this),
      getPermittedAccounts: this.getPermittedAccounts.bind(this),
      // getProviderConfig: () => this.networkController.store.getState().provider,
      // getCurrentNetworkEIP1559Compatibility:
      //   this.networkController.getEIP1559Compatibility.bind(
      //     this.networkController,
      //   ),
      getCurrentAccountEIP1559Compatibility:
        this.getCurrentAccountEIP1559Compatibility.bind(this),
      getNetworkState: () => this.networkController.store.getState().network,
      onNetworkStateChange: (listener) =>
        this.networkController.networkStore.subscribe(listener),
      // getCurrentChainId: () =>
      //   this.networkController.store.getState().provider.chainId,
      chainsController: this.chainsController,
      dextradeController: this.dextradeController,
      swapsController: this.swapsController,
      preferencesStore: this.preferencesController.store,
      txHistoryLimit: 60,
      keyringController: this.keyringController,
      signTransaction: this.keyringController.signTransaction.bind(
        this.keyringController,
      ),
      createEventFragment: this.metaMetricsController.createEventFragment.bind(
        this.metaMetricsController,
      ),
      updateEventFragment: this.metaMetricsController.updateEventFragment.bind(
        this.metaMetricsController,
      ),
      finalizeEventFragment:
        this.metaMetricsController.finalizeEventFragment.bind(
          this.metaMetricsController,
        ),
      getEventFragmentById:
        this.metaMetricsController.getEventFragmentById.bind(
          this.metaMetricsController,
        ),
      trackMetaMetricsEvent: this.metaMetricsController.trackEvent.bind(
        this.metaMetricsController,
      ),
      getParticipateInMetrics: () =>
        this.metaMetricsController.state.participateInMetaMetrics,
      getEIP1559GasFeeEstimates:
        this.gasFeeController.fetchGasFeeEstimates.bind(this.gasFeeController),
      getExternalPendingTransactions:
        this.getExternalPendingTransactions.bind(this),
      getAccountType: this.getAccountType.bind(this),
      getDeviceModel: this.getDeviceModel.bind(this),
      getTokenStandardAndDetails: this.getTokenStandardAndDetails.bind(this),
      securityProviderRequest: this.securityProviderRequest.bind(this),
      fetchLocalTokenRate: this.currencyRateController.fetchLocalTokenRate.bind(
        this.currencyRateController,
      ),
    });
    this.txController.on('newUnapprovedTx', () => this.showUserConfirmation());

    this.txController.on(`tx:status-update`, async (txId, status) => {
      if (
        status === TransactionStatus.confirmed ||
        status === TransactionStatus.failed
      ) {
        const txMeta = this.txController.txStateManager.getTransaction(txId);
        let rpcPrefs = {};
        if (txMeta.chainId) {
          const { networkConfigurations } =
            this.networkController.store.getState();
          const matchingNetworkConfig = Object.values(
            networkConfigurations,
          ).find(
            (networkConfiguration) =>
              networkConfiguration.chainId === txMeta.chainId,
          );
          rpcPrefs = matchingNetworkConfig?.rpcPrefs ?? {};
        }
        this.platform.showTransactionNotification(txMeta, rpcPrefs);

        const { txReceipt } = txMeta;

        // if this is a transferFrom method generated from within the app it may be an NFT transfer transaction
        // in which case we will want to check and update ownership status of the transferred NFT.
        // if (
        //   txMeta.type === TransactionType.tokenMethodTransferFrom &&
        //   txMeta.txParams !== undefined
        // ) {
        //   const {
        //     data,
        //     to: contractAddress,
        //     from: userAddress,
        //   } = txMeta.txParams;
        //   const { chainId } = txMeta;
        //   const transactionData = parseStandardTokenTransactionData(data);
        //   // Sometimes the tokenId value is parsed as "_value" param. Not seeing this often any more, but still occasionally:
        //   // i.e. call approve() on BAYC contract - https://etherscan.io/token/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d#writeContract, and tokenId shows up as _value,
        //   // not sure why since it doesn't match the ERC721 ABI spec we use to parse these transactions - https://github.com/MetaMask/metamask-eth-abis/blob/d0474308a288f9252597b7c93a3a8deaad19e1b2/src/abis/abiERC721.ts#L62.
        //   const transactionDataTokenId =
        //     getTokenIdParam(transactionData) ??
        //     getTokenValueParam(transactionData);
        //   const { allNfts } = this.nftController.state;

        //   const chainIdAsDecimal = hexToDecimal(chainId);
        //   // check if its a known NFT
        //   const knownNft = allNfts?.[userAddress]?.[chainIdAsDecimal]?.find(
        //     ({ address, tokenId }) =>
        //       isEqualCaseInsensitive(address, contractAddress) &&
        //       tokenId === transactionDataTokenId,
        //   );

        //   // if it is we check and update ownership status.
        //   if (knownNft) {
        //     this.nftController.checkAndUpdateSingleNftOwnershipStatus(
        //       knownNft,
        //       false,
        //       { userAddress, chainId: chainIdAsDecimal },
        //     );
        //   }
        // }

        const metamaskState = this.getState();

        if (txReceipt && txReceipt.status === '0x0') {
          this.metaMetricsController.trackEvent(
            {
              event: 'Tx Status Update: On-Chain Failure',
              category: EVENT.CATEGORIES.BACKGROUND,
              properties: {
                action: 'Transactions',
                errorMessage: txMeta.simulationFails?.reason,
                numberOfTokens: metamaskState.tokens.length,
                numberOfAccounts: Object.keys(metamaskState.accounts).length,
              },
            },
            {
              matomoEvent: true,
            },
          );
        }
      }
    });

    this.decryptMessageManager = new DecryptMessageManager({
      metricsEvent: this.metaMetricsController.trackEvent.bind(
        this.metaMetricsController,
      ),
    });
    this.encryptionPublicKeyManager = new EncryptionPublicKeyManager({
      metricsEvent: this.metaMetricsController.trackEvent.bind(
        this.metaMetricsController,
      ),
    });

    this.multisignerController = new MultisignerController({
      state: initState.MultisignerController,
      preferencesController: this.preferencesController,
      keyringController: this.keyringController,
      chainsController: this.chainsController,
      deriveHdKey: this.deriveHdKey.bind(this),
      getWalletMnemonicHash: () => this.dextradeController.state.mnemonicHash,
      getSelectedAddress: () =>
        this.preferencesController.store.getState().selectedAddress,
      getTokensWithBalances: () => {
        if (!this.assetBalancesController) {
          return [];
        }
        const tokens = this.assetBalancesController.state?.balances || {};
        return tokens[this.preferencesController.getSelectedAddress()] || [];
      },
      getRates: () => this.currencyRateController.state.rates,
      addMultisignTransaction: this.txController.addMultisignTransaction.bind(
        this.txController,
      ),
    });

    this.onAssetChanges = debounce(
      async () => {
        try {
          this.currencyRateController.updateExchangeRate();
        } catch (error) {
          // TODO: Handle failure to get conversion rate more gracefully
          console.error(error);
        }
      },
      500,
      {
        leading: true,
        trailing: false,
      },
    );

    this.tokensController.hub.on('assets:new', this.onAssetChanges);
    this.tokensController.hub.on('pendingSuggestedAsset', async () => {
      await opts.openPopup();
    });

    this.exchangerController = new ExchangerController({
      state: initState.ExchangerController,
      txController: this.txController,
      keyringController: this.keyringController,
      tokensController: this.tokensController,
      preferencesController: this.preferencesController,
      chainsController: this.chainsController,
      dextradeController: this.dextradeController,
      swapsController: this.swapsController,
      isUnlocked: this.isUnlocked.bind(this),
      convertCoinToAsset: this.convertCoinToAsset.bind(this),
      getCurrentTokens: () =>
        this.tokensController.state.tokens.map((t) =>
          this.getAssetModelBackground(t),
        ),
    });

    this.assetBalancesController = new AssetBalancesController({
      chainsController: this.chainsController,
      multisignerController: this.multisignerController,
      keyringController: this.keyringController,
      getTokens: () => this.tokensController.state.tokens,
      getSelectedAddress: () => this.preferencesController.getSelectedAddress(),
      state: initState.AssetBalancesController,
      getRates: () => this.currencyRateController.state.rates,
    });
    this.assetBalancesController.hub.on('balances:updated', () => {
      this.exchangerController.syncTokenReserves();
    });

    this.signController = new SignController({
      messenger: this.controllerMessenger.getRestricted({
        name: 'SignController',
        allowedActions: [
          `${this.approvalController.name}:addRequest`,
          `${this.approvalController.name}:acceptRequest`,
          `${this.approvalController.name}:rejectRequest`,
        ],
      }),
      keyringController: this.keyringController,
      preferencesController: this.preferencesController,
      getState: this.getState.bind(this),
      securityProviderRequest: this.securityProviderRequest.bind(this),
    });

    // this.smartTransactionsController = new SmartTransactionsController(
    //   {
    //     onNetworkStateChange: (cb) => {
    //       this.networkController.store.subscribe((networkState) => {
    //         const modifiedNetworkState = {
    //           ...networkState,
    //           providerConfig: {
    //             ...networkState.provider,
    //           },
    //         };
    //         return cb(modifiedNetworkState);
    //       });
    //     },
    //     getNetwork: () => this.networkController.store.getState().network,
    //     getNonceLock: this.txController.nonceTracker.getNonceLock.bind(
    //       this.txController.nonceTracker,
    //     ),
    //     confirmExternalTransaction:
    //       this.txController.confirmExternalTransaction.bind(this.txController),
    //     trackMetaMetricsEvent: this.metaMetricsController.trackEvent.bind(
    //       this.metaMetricsController,
    //     ),
    //   },
    //   {
    //     supportedChainIds: [CHAIN_IDS.MAINNET, CHAIN_IDS.GOERLI],
    //   },
    //   initState.SmartTransactionsController,
    // );

    // clear unapproved transactions and messages when the network will change
    this.networkController.on(NETWORK_EVENTS.NETWORK_WILL_CHANGE, () => {
      this.txController.txStateManager.clearUnapprovedTxs();
      this.encryptionPublicKeyManager.clearUnapproved();
      this.decryptMessageManager.clearUnapproved();
      this.signController.clearUnapproved();
    });

    this.walletConnectController = new WalletConnectController(
      initState.WalletConnectController,
      {
        preferencesController: this.preferencesController,
        transactionController: this.txController,
        chainsController: this.chainsController,
        approvalController: this.approvalController,
        subjectMetadataController: this.subjectMetadataController,
        signController: this.signController,
      },
    );

    this.metamaskMiddleware = createMetamaskMiddleware({
      static: {
        eth_syncing: false,
        web3_clientVersion: `MetaMask/v${version}`,
      },
      version,
      // account mgmt
      getAccounts: async (
        { origin: innerOrigin },
        { suppressUnauthorizedError = true } = {},
      ) => {
        if (innerOrigin === ORIGIN_METAMASK) {
          const selectedAddress =
            this.preferencesController.getSelectedAddress();
          return selectedAddress ? [selectedAddress] : [];
        } else if (this.isUnlocked()) {
          return await this.getPermittedAccounts(innerOrigin, {
            suppressUnauthorizedError,
          });
        }
        return []; // changing this is a breaking change
      },
      // tx signing
      processTransaction: this.newUnapprovedTransaction.bind(this),
      // msg signing
      processEthSignMessage: this.signController.newUnsignedMessage.bind(
        this.signController,
      ),
      processTypedMessage: this.signController.newUnsignedTypedMessage.bind(
        this.signController,
      ),
      processTypedMessageV3: this.signController.newUnsignedTypedMessage.bind(
        this.signController,
      ),
      processTypedMessageV4: this.signController.newUnsignedTypedMessage.bind(
        this.signController,
      ),
      processPersonalMessage:
        this.signController.newUnsignedPersonalMessage.bind(
          this.signController,
        ),
      processDecryptMessage: this.newRequestDecryptMessage.bind(this),
      processEncryptionPublicKey: this.newRequestEncryptionPublicKey.bind(this),
      getPendingNonce: this.getPendingNonce.bind(this),
      getPendingTransactionByHash: (hash) =>
        this.txController.getTransactions({
          searchCriteria: {
            hash,
            status: TransactionStatus.submitted,
          },
        })[0],
    });

    // ensure isClientOpenAndUnlocked is updated when memState updates
    this.on('update', (memState) => this._onStateUpdate(memState));

    /**
     * All controllers in Memstore but not in store. They are not persisted.
     * On chrome profile re-start, they will be re-initialized.
     */
    const resetOnRestartStore = {
      // AccountTracker: this.accountTracker.store,
      TxController: this.txController.memStore,
      DecryptMessageManager: this.decryptMessageManager.memStore,
      EncryptionPublicKeyManager: this.encryptionPublicKeyManager.memStore,
      SignController: this.signController,
      SwapsController: this.swapsController.store,
      // EnsController: this.ensController.store,
      ApprovalController: this.approvalController,
    };

    this.store.updateStructure({
      AppStateController: this.appStateController.store,
      TransactionController: this.txController.store,
      KeyringController: this.keyringController.store,
      PreferencesController: this.preferencesController.store,
      MetaMetricsController: this.metaMetricsController.store,
      AddressBookController: this.addressBookController,
      CurrencyController: this.currencyRateController,
      NetworkController: this.networkController.store,
      // CachedBalancesController: this.cachedBalancesController.store,
      AlertController: this.alertController.store,
      OnboardingController: this.onboardingController.store,
      PermissionController: this.permissionController,
      PermissionLogController: this.permissionLogController.store,
      SubjectMetadataController: this.subjectMetadataController,
      BackupController: this.backupController,
      AnnouncementController: this.announcementController,
      GasFeeController: this.gasFeeController,
      TokensController: this.tokensController,
      ExchangerController: this.exchangerController,
      MultisignerController: this.multisignerController,
      AssetBalancesController: this.assetBalancesController,
      // SmartTransactionsController: this.smartTransactionsController,
      // NftController: this.nftController,
      PhishingController: this.phishingController,
      ChainsController: this.chainsController.store,
      DextradeController: this.dextradeController,
      ///: BEGIN:ONLY_INCLUDE_IN(flask)
      // SnapController: this.snapController,
      // CronjobController: this.cronjobController,
      NotificationController: this.notificationController,
      // DesktopController: this.desktopController.store,
      ///: END:ONLY_INCLUDE_IN
      WalletConnectController: this.walletConnectController.store,
      ...resetOnRestartStore,
    });

    this.memStore = new ComposableObservableStore({
      config: {
        AppStateController: this.appStateController.store,
        NetworkController: this.networkController.store,
        // CachedBalancesController: this.cachedBalancesController.store,
        KeyringController: this.keyringController.memStore,
        PreferencesController: this.preferencesController.store,
        MetaMetricsController: this.metaMetricsController.store,
        AddressBookController: this.addressBookController,
        CurrencyController: this.currencyRateController,
        AlertController: this.alertController.store,
        OnboardingController: this.onboardingController.store,
        PermissionController: this.permissionController,
        PermissionLogController: this.permissionLogController.store,
        SubjectMetadataController: this.subjectMetadataController,
        BackupController: this.backupController,
        AnnouncementController: this.announcementController,
        GasFeeController: this.gasFeeController,
        TokensController: this.tokensController,
        ExchangerController: this.exchangerController,
        MultisignerController: this.multisignerController,
        AssetBalancesController: this.assetBalancesController,
        // SmartTransactionsController: this.smartTransactionsController,
        // NftController: this.nftController,
        ChainsController: this.chainsController.store,
        DextradeController: this.dextradeController,
        ///: BEGIN:ONLY_INCLUDE_IN(flask)
        // SnapController: this.snapController,
        // CronjobController: this.cronjobController,
        NotificationController: this.notificationController,
        // DesktopController: this.desktopController.store,
        ///: END:ONLY_INCLUDE_IN
        WalletConnectController: this.walletConnectController.store,
        ...resetOnRestartStore,
      },
      controllerMessenger: this.controllerMessenger,
    });

    // if this is the first time, clear the state of by calling these methods
    const resetMethods = [
      // this.accountTracker.resetState,
      this.txController.resetState,
      this.decryptMessageManager.resetState,
      this.encryptionPublicKeyManager.resetState,
      this.signController.resetState.bind(this.signController),
      this.swapsController.resetState,
      // this.ensController.resetState,
      this.approvalController.clear.bind(this.approvalController),
      // WE SHOULD ADD TokenListController.resetState here too. But it's not implemented yet.
    ];

    if (isManifestV3) {
      if (globalThis.isFirstTimeProfileLoaded === true) {
        this.resetStates(resetMethods);
      }
    } else {
      // it's always the first time in MV2
      this.resetStates(resetMethods);
    }

    // Automatic login via config password or loginToken
    if (
      !this.isUnlocked() &&
      this.onboardingController.store.getState().completedOnboarding
    ) {
      this._loginUser();
    } else {
      this._startUISync();
    }

    // Lazily update the store with the current extension environment
    this.platform.getPlatformInfo(({ os }) => {
      this.appStateController.setBrowserEnvironment(
        os,
        // This method is presently only supported by Firefox
        'chrome',
      );
    });

    this.setupControllerEventSubscriptions();

    // For more information about these legacy streams, see here:
    // https://github.com/MetaMask/metamask-extension/issues/15491
    // TODO:LegacyProvider: Delete
    // this.publicConfigStore = this.createPublicConfigStore();

    // Multiple MetaMask instances launched warning
    // this.extension.runtime.onMessageExternal.addListener(onMessageReceived);
    // Fire a ping message to check if other extensions are running
    // checkForMultipleVersionsRunning();
  }

  showUserConfirmation() {
    this.emit('showUserConfirmation');
    if (this.opts.showUserConfirmation) {
      this.opts.showUserConfirmation();
    }
  }

  triggerNetworkrequests() {
    this.chainsController.start();
    this.assetBalancesController.start();
    this.txController.pendingTxTracker.start();
    if (this.preferencesController.store.getState().useCurrencyRateCheck) {
      this.currencyRateController.start();
    }
    this.exchangerController.start();
  }

  stopNetworkRequests() {
    this.chainsController.stop();
    this.assetBalancesController.stop();
    this.txController.pendingTxTracker.stop();
    if (this.preferencesController.store.getState().useCurrencyRateCheck) {
      this.currencyRateController.stop();
    }
    this.exchangerController.stop();
  }

  canUseHardwareWallets() {
    return !isManifestV3 || process.env.CONF?.HARDWARE_WALLETS_MV3;
  }

  resetStates(resetMethods) {
    resetMethods.forEach((resetMethod) => {
      try {
        resetMethod();
      } catch (err) {
        console.error(err);
      }
    });

    globalThis.isFirstTimeProfileLoaded = false;
  }

  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  /**
   * Constructor helper for getting Snap permission specifications.
   */
  getSnapPermissionSpecifications() {
    return {
      ...buildSnapEndowmentSpecifications(),
      ...buildSnapRestrictedMethodSpecifications({
        clearSnapState: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:clearSnapState',
        ),
        getMnemonic: this.getPrimaryKeyringMnemonic.bind(this),
        getUnlockPromise: this.appStateController.getUnlockPromise.bind(
          this.appStateController,
        ),
        getSnap: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:get',
        ),
        handleSnapRpcRequest: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:handleRequest',
        ),
        getSnapState: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:getSnapState',
        ),
        showConfirmation: (origin, confirmationData) =>
          this.approvalController.addAndShowApprovalRequest({
            origin,
            type: MESSAGE_TYPE.SNAP_DIALOG_CONFIRMATION,
            requestData: confirmationData,
          }),
        showDialog: (origin, type, content, placeholder) =>
          this.approvalController.addAndShowApprovalRequest({
            origin,
            type: SNAP_DIALOG_TYPES[type],
            requestData: { content, placeholder },
          }),
        showNativeNotification: (origin, args) =>
          this.controllerMessenger.call(
            'RateLimitController:call',
            origin,
            'showNativeNotification',
            origin,
            args.message,
          ),
        showInAppNotification: (origin, args) =>
          this.controllerMessenger.call(
            'RateLimitController:call',
            origin,
            'showInAppNotification',
            origin,
            args.message,
          ),
        updateSnapState: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:updateSnapState',
        ),
      }),
    };
  }

  /**
   * Deletes the specified notifications from state.
   *
   * @param {string[]} ids - The notifications ids to delete.
   */
  dismissNotifications(ids) {
    this.notificationController.dismiss(ids);
  }

  /**
   * Updates the readDate attribute of the specified notifications.
   *
   * @param {string[]} ids - The notifications ids to mark as read.
   */
  markNotificationsAsRead(ids) {
    this.notificationController.markRead(ids);
  }

  ///: END:ONLY_INCLUDE_IN

  /**
   * Sets up BaseController V2 event subscriptions. Currently, this includes
   * the subscriptions necessary to notify permission subjects of account
   * changes.
   *
   * Some of the subscriptions in this method are ControllerMessenger selector
   * event subscriptions. See the relevant documentation for
   * `@metamask/base-controller` for more information.
   *
   * Note that account-related notifications emitted when the extension
   * becomes unlocked are handled in MetaMaskController._onUnlock.
   */
  setupControllerEventSubscriptions() {
    const handleAccountsChange = async (origin, newAccounts) => {
      if (this.isUnlocked()) {
        this.notifyConnections(origin, {
          method: NOTIFICATION_NAMES.accountsChanged,
          // This should be the same as the return value of `eth_accounts`,
          // namely an array of the current / most recently selected Ethereum
          // account.
          params:
            newAccounts.length < 2
              ? // If the length is 1 or 0, the accounts are sorted by definition.
                newAccounts
              : // If the length is 2 or greater, we have to execute
                // `eth_accounts` vi this method.
                await this.getPermittedAccounts(origin),
        });
      }

      this.permissionLogController.updateAccountsHistory(origin, newAccounts);
    };

    // This handles account changes whenever the selected address changes.
    let lastSelectedAddress;
    this.preferencesController.store.subscribe(async ({ selectedAddress }) => {
      if (selectedAddress && selectedAddress !== lastSelectedAddress) {
        lastSelectedAddress = selectedAddress;
        const permittedAccountsMap = getPermittedAccountsByOrigin(
          this.permissionController.state,
        );

        for (const [origin, accounts] of permittedAccountsMap.entries()) {
          if (accounts.includes(selectedAddress)) {
            handleAccountsChange(origin, accounts);
          }
        }
        const mnemonicHash = await this.generateWalletMnemonicHash();
        this.dextradeController.setMnemonicHash(mnemonicHash);
      }
    });

    // This handles account changes every time relevant permission state
    // changes, for any reason.
    this.controllerMessenger.subscribe(
      `${this.permissionController.name}:stateChange`,
      async (currentValue, previousValue) => {
        const changedAccounts = getChangedAccounts(currentValue, previousValue);

        for (const [origin, accounts] of changedAccounts.entries()) {
          handleAccountsChange(origin, accounts);
        }
      },
      getPermittedAccountsByOrigin,
    );
  }

  /**
   * Gets relevant state for the provider of an external origin.
   *
   * @param {string} origin - The origin to get the provider state for.
   * @returns {Promise<{
   *  isUnlocked: boolean,
   *  networkVersion: string,
   *  chainId: string,
   *  accounts: string[],
   * }>} An object with relevant state properties.
   */
  async getProviderState(origin) {
    return {
      isUnlocked: this.isUnlocked(),
      ...this.getProviderNetworkState(),
      accounts: await this.getPermittedAccounts(origin),
    };
  }

  /**
   * Gets network state relevant for external providers.
   *
   * @param {object} [memState] - The MetaMask memState. If not provided,
   * this function will retrieve the most recent state.
   * @returns {object} An object with relevant network state properties.
   */
  getProviderNetworkState(memState) {
    const { network } = memState || this.getState();
    return {
      chainId: '0x1',
      networkVersion: network,
    };
  }

  //=============================================================================
  // EXPOSED TO THE UI SUBSYSTEM
  //=============================================================================

  /**
   * The metamask-state of the various controllers, made available to the UI
   *
   * @returns {object} status
   */
  getState() {
    const { vault } = this.keyringController.store.getState();
    const isInitialized = Boolean(vault);
    return {
      isInitialized,
      ...this.memStore.getFlatState(),
    };
  }

  /**
   * Returns an Object containing API Callback Functions.
   * These functions are the interface for the UI.
   * The API object can be transmitted over a stream via JSON-RPC.
   *
   * @returns {object} Object containing API functions.
   */
  getApi() {
    const {
      addressBookController,
      alertController,
      appStateController,
      // nftDetectionController,
      currencyRateController,
      detectTokensController,
      // ensController,
      gasFeeController,
      metaMetricsController,
      networkController,
      announcementController,
      onboardingController,
      permissionController,
      preferencesController,
      // qrHardwareKeyring,
      swapsController,
      exchangerController,
      tokensController,
      // smartTransactionsController,
      txController,
      // assetsContractController,
      backupController,
      approvalController,
      multisignerController,
      walletConnectController,
      dextradeController,
    } = this;

    return {
      // etc
      getState: this.getState.bind(this),
      setCurrentCurrency: currencyRateController.setCurrentCurrency.bind(
        currencyRateController,
      ),
      setUseBlockie: preferencesController.setUseBlockie.bind(
        preferencesController,
      ),
      setUseNonceField: preferencesController.setUseNonceField.bind(
        preferencesController,
      ),
      setUsePhishDetect: preferencesController.setUsePhishDetect.bind(
        preferencesController,
      ),
      setUseMultiAccountBalanceChecker:
        preferencesController.setUseMultiAccountBalanceChecker.bind(
          preferencesController,
        ),
      setUseTokenDetection: preferencesController.setUseTokenDetection.bind(
        preferencesController,
      ),
      setUseNftDetection: preferencesController.setUseNftDetection.bind(
        preferencesController,
      ),
      setUseCurrencyRateCheck:
        preferencesController.setUseCurrencyRateCheck.bind(
          preferencesController,
        ),
      setOpenSeaEnabled: preferencesController.setOpenSeaEnabled.bind(
        preferencesController,
      ),
      setIpfsGateway: preferencesController.setIpfsGateway.bind(
        preferencesController,
      ),
      setParticipateInMetaMetrics:
        metaMetricsController.setParticipateInMetaMetrics.bind(
          metaMetricsController,
        ),
      setCurrentLocale: preferencesController.setCurrentLocale.bind(
        preferencesController,
      ),
      markPasswordForgotten: this.markPasswordForgotten.bind(this),
      unMarkPasswordForgotten: this.unMarkPasswordForgotten.bind(this),
      getRequestAccountTabIds: () => {
        /* no implemented */
      },
      getOpenMetamaskTabsIds: this.getOpenMetamaskTabsIds,
      markNotificationPopupAsAutomaticallyClosed: () =>
        this.notificationManager.markAsAutomaticallyClosed(),

      // approval
      requestUserApproval:
        approvalController.addAndShowApprovalRequest.bind(approvalController),

      // primary HD keyring management
      addNewAccount: this.addNewAccount.bind(this),
      verifySeedPhrase: this.verifySeedPhrase.bind(this),
      resetAccount: this.resetAccount.bind(this),
      removeAccount: this.removeAccount.bind(this),
      importAccountWithStrategy: this.importAccountWithStrategy.bind(this),

      // hardware wallets
      connectHardware: this.connectHardware.bind(this),
      forgetDevice: this.forgetDevice.bind(this),
      checkHardwareStatus: this.checkHardwareStatus.bind(this),
      unlockHardwareWalletAccount: this.unlockHardwareWalletAccount.bind(this),
      setLedgerTransportPreference:
        this.setLedgerTransportPreference.bind(this),
      attemptLedgerTransportCreation:
        this.attemptLedgerTransportCreation.bind(this),
      establishLedgerTransportPreference:
        this.establishLedgerTransportPreference.bind(this),

      // qr hardware devices
      // submitQRHardwareCryptoHDKey:
      //   qrHardwareKeyring.submitCryptoHDKey.bind(qrHardwareKeyring),
      // submitQRHardwareCryptoAccount:
      //   qrHardwareKeyring.submitCryptoAccount.bind(qrHardwareKeyring),
      // cancelSyncQRHardware:
      //   qrHardwareKeyring.cancelSync.bind(qrHardwareKeyring),
      // submitQRHardwareSignature:
      //   qrHardwareKeyring.submitSignature.bind(qrHardwareKeyring),
      // cancelQRHardwareSignRequest:
      //   qrHardwareKeyring.cancelSignRequest.bind(qrHardwareKeyring),

      // mobile
      fetchInfoToSync: this.fetchInfoToSync.bind(this),

      // vault management
      submitPassword: this.submitPassword.bind(this),
      verifyPassword: this.verifyPassword.bind(this),

      // network management
      setProviderType:
        networkController.setProviderType.bind(networkController),
      rollbackToPreviousProvider:
        networkController.rollbackToPreviousProvider.bind(networkController),
      removeNetworkConfiguration: this.chainsController.removeChain.bind(
        this.chainsController,
      ),
      setActiveNetwork:
        networkController.setActiveNetwork.bind(networkController),
      upsertNetworkConfiguration:
        this.chainsController.upsertNetworkConfiguration.bind(
          this.chainsController,
        ),
      // PreferencesController
      setSelectedAddress: preferencesController.setSelectedAddress.bind(
        preferencesController,
      ),
      setPendingTokens: this.assetBalancesController.setPendingTokens.bind(
        this.assetBalancesController,
      ),
      clearPendingTokens: this.assetBalancesController.clearPendingTokens.bind(
        this.assetBalancesController,
      ),
      addToken: tokensController.addToken.bind(tokensController),
      initTokens: tokensController.initTokens.bind(tokensController),
      rejectWatchAsset:
        tokensController.rejectWatchAsset.bind(tokensController),
      acceptWatchAsset:
        tokensController.acceptWatchAsset.bind(tokensController),
      updateTokenType: tokensController.updateTokenType.bind(tokensController),
      setAccountLabel: preferencesController.setAccountLabel.bind(
        preferencesController,
      ),
      setFeatureFlag: preferencesController.setFeatureFlag.bind(
        preferencesController,
      ),
      setPreference: preferencesController.setPreference.bind(
        preferencesController,
      ),

      addKnownMethodData: preferencesController.addKnownMethodData.bind(
        preferencesController,
      ),
      setDismissSeedBackUpReminder:
        preferencesController.setDismissSeedBackUpReminder.bind(
          preferencesController,
        ),
      setDisabledRpcMethodPreference:
        preferencesController.setDisabledRpcMethodPreference.bind(
          preferencesController,
        ),
      getRpcMethodPreferences:
        preferencesController.getRpcMethodPreferences.bind(
          preferencesController,
        ),
      setAdvancedGasFee: preferencesController.setAdvancedGasFee.bind(
        preferencesController,
      ),
      setTheme: preferencesController.setTheme.bind(preferencesController),
      setTransactionSecurityCheckEnabled:
        preferencesController.setTransactionSecurityCheckEnabled.bind(
          preferencesController,
        ),
      setOpenSeaTransactionSecurityProviderPopoverHasBeenShown:
        preferencesController.setOpenSeaTransactionSecurityProviderPopoverHasBeenShown.bind(
          preferencesController,
        ),
      // AssetsContractController
      getTokenStandardAndDetails: this.getTokenStandardAndDetails.bind(this),

      // NftController
      // addNft: nftController.addNft.bind(nftController),

      // addNftVerifyOwnership:
      //   nftController.addNftVerifyOwnership.bind(nftController),

      // removeAndIgnoreNft: nftController.removeAndIgnoreNft.bind(nftController),

      // removeNft: nftController.removeNft.bind(nftController),

      // checkAndUpdateAllNftsOwnershipStatus:
      //   nftController.checkAndUpdateAllNftsOwnershipStatus.bind(nftController),

      // checkAndUpdateSingleNftOwnershipStatus:
      //   nftController.checkAndUpdateSingleNftOwnershipStatus.bind(
      //     nftController,
      //   ),

      // isNftOwner: nftController.isNftOwner.bind(nftController),

      // AddressController
      setAddressBook: addressBookController.set.bind(addressBookController),
      removeFromAddressBook: addressBookController.delete.bind(
        addressBookController,
      ),

      // AppStateController
      setLastActiveTime:
        appStateController.setLastActiveTime.bind(appStateController),
      setDefaultHomeActiveTabName:
        appStateController.setDefaultHomeActiveTabName.bind(appStateController),
      setDefaultSwapsActiveTabName:
        appStateController.setDefaultSwapsActiveTabName.bind(
          appStateController,
        ),
      setConnectedStatusPopoverHasBeenShown:
        appStateController.setConnectedStatusPopoverHasBeenShown.bind(
          appStateController,
        ),
      setRecoveryPhraseReminderHasBeenShown:
        appStateController.setRecoveryPhraseReminderHasBeenShown.bind(
          appStateController,
        ),
      setRecoveryPhraseReminderLastShown:
        appStateController.setRecoveryPhraseReminderLastShown.bind(
          appStateController,
        ),
      setOutdatedBrowserWarningLastShown:
        appStateController.setOutdatedBrowserWarningLastShown.bind(
          appStateController,
        ),
      setShowTestnetMessageInDropdown:
        appStateController.setShowTestnetMessageInDropdown.bind(
          appStateController,
        ),
      setShowBetaHeader:
        appStateController.setShowBetaHeader.bind(appStateController),
      updateNftDropDownState:
        appStateController.updateNftDropDownState.bind(appStateController),
      setFirstTimeUsedNetwork:
        appStateController.setFirstTimeUsedNetwork.bind(appStateController),

      // EnsController
      // tryReverseResolveAddress:
      //   ensController.reverseResolveAddress.bind(ensController),
      tryReverseResolveAddress: (address) => {
        return address;
      },

      // KeyringController
      setLocked: this.setLocked.bind(this),
      createNewVaultAndKeychain: this.createNewVaultAndKeychain.bind(this),
      createNewVaultAndRestore: this.createNewVaultAndRestore.bind(this),
      exportAccount: this.exportAccount.bind(this),

      // txController
      cancelTransaction: txController.cancelTransaction.bind(txController),
      updateTransaction: txController.updateTransaction.bind(txController),
      updateAndApproveTransaction:
        txController.updateAndApproveTransaction.bind(txController),
      approveTransactionsWithSameNonce:
        txController.approveTransactionsWithSameNonce.bind(txController),
      createCancelTransaction: this.createCancelTransaction.bind(this),
      createSpeedUpTransaction: this.createSpeedUpTransaction.bind(this),
      estimateGas: this.estimateGas.bind(this),
      getNextNonce: this.getNextNonce.bind(this),
      createUnapprovedTransaction:
        txController.createUnapprovedTransaction.bind(txController),
      createDextradeSwapTransaction:
        txController.createDextradeSwapTransaction.bind(txController),
      updateAndApproveP2PTransaction:
        txController.updateAndApproveP2PTransaction.bind(txController),
      emulateTransaction: txController.emulateTransaction.bind(txController),
      addUnapprovedTransaction:
        txController.addUnapprovedTransaction.bind(txController),
      newUnapprovedTransaction:
        txController.newUnapprovedTransaction.bind(txController),
      createTransactionEventFragment:
        txController.createTransactionEventFragment.bind(txController),
      getTransactions: txController.getTransactions.bind(txController),

      updateEditableParams:
        txController.updateEditableParams.bind(txController),
      updateTransactionGasFees:
        txController.updateTransactionGasFees.bind(txController),
      updateTransactionSendFlowHistory:
        txController.updateTransactionSendFlowHistory.bind(txController),

      updateSwapApprovalTransaction:
        txController.updateSwapApprovalTransaction.bind(txController),
      updateSwapTransaction:
        txController.updateSwapTransaction.bind(txController),

      updatePreviousGasParams:
        txController.updatePreviousGasParams.bind(txController),

      // signController
      signMessage: this.signController.signMessage.bind(this.signController),
      cancelMessage: this.signController.cancelMessage.bind(
        this.signController,
      ),
      signPersonalMessage: this.signController.signPersonalMessage.bind(
        this.signController,
      ),
      cancelPersonalMessage: this.signController.cancelPersonalMessage.bind(
        this.signController,
      ),
      signTypedMessage: this.signController.signTypedMessage.bind(
        this.signController,
      ),
      cancelTypedMessage: this.signController.cancelTypedMessage.bind(
        this.signController,
      ),

      // decryptMessageManager
      decryptMessage: this.decryptMessage.bind(this),
      decryptMessageInline: this.decryptMessageInline.bind(this),
      cancelDecryptMessage: this.cancelDecryptMessage.bind(this),

      // EncryptionPublicKeyManager
      encryptionPublicKey: this.encryptionPublicKey.bind(this),
      cancelEncryptionPublicKey: this.cancelEncryptionPublicKey.bind(this),

      // onboarding controller
      setSeedPhraseBackedUp:
        onboardingController.setSeedPhraseBackedUp.bind(onboardingController),
      completeOnboarding:
        onboardingController.completeOnboarding.bind(onboardingController),
      setFirstTimeFlowType:
        onboardingController.setFirstTimeFlowType.bind(onboardingController),

      // alert controller
      setAlertEnabledness:
        alertController.setAlertEnabledness.bind(alertController),
      setUnconnectedAccountAlertShown:
        alertController.setUnconnectedAccountAlertShown.bind(alertController),
      setWeb3ShimUsageAlertDismissed:
        alertController.setWeb3ShimUsageAlertDismissed.bind(alertController),

      // permissions
      removePermissionsFor: this.removePermissionsFor,
      approvePermissionsRequest: this.acceptPermissionsRequest,
      rejectPermissionsRequest: this.rejectPermissionsRequest,
      ...getPermissionBackgroundApiMethods(permissionController),

      ///: BEGIN:ONLY_INCLUDE_IN(flask)
      // snaps
      // removeSnapError: this.controllerMessenger.call.bind(
      //   this.controllerMessenger,
      //   'SnapController:removeSnapError',
      // ),
      // disableSnap: this.controllerMessenger.call.bind(
      //   this.controllerMessenger,
      //   'SnapController:disable',
      // ),
      // enableSnap: this.controllerMessenger.call.bind(
      //   this.controllerMessenger,
      //   'SnapController:enable',
      // ),
      // removeSnap: this.controllerMessenger.call.bind(
      //   this.controllerMessenger,
      //   'SnapController:remove',
      // ),
      // handleSnapRequest: this.controllerMessenger.call.bind(
      //   this.controllerMessenger,
      //   'SnapController:handleRequest',
      // ),
      // dismissNotifications: this.dismissNotifications.bind(this),
      // markNotificationsAsRead: this.markNotificationsAsRead.bind(this),
      // // Desktop
      // getDesktopEnabled: this.desktopController.getDesktopEnabled.bind(
      //   this.desktopController,
      // ),
      // setDesktopEnabled: this.desktopController.setDesktopEnabled.bind(
      //   this.desktopController,
      // ),
      // generateDesktopOtp: this.desktopController.generateOtp.bind(
      //   this.desktopController,
      // ),
      // testDesktopConnection: this.desktopController.testDesktopConnection.bind(
      //   this.desktopController,
      // ),
      // disableDesktop: this.desktopController.disableDesktop.bind(
      //   this.desktopController,
      // ),
      ///: END:ONLY_INCLUDE_IN

      // exchanger
      p2pExchangesExchangerCreate:
        exchangerController.p2pExchangesExchangerCreate.bind(
          exchangerController,
        ),
      p2pLoadExchanger:
        exchangerController.p2pLoadExchanger.bind(exchangerController),
      p2pCommitReserves:
        exchangerController.p2pCommitReserves.bind(exchangerController),
      p2pCommitReservesSettings:
        exchangerController.p2pCommitReservesSettings.bind(exchangerController),
      p2pRemoveReserveSetting:
        exchangerController.removeReserveSetting.bind(exchangerController),
      exchangerUpdate:
        exchangerController.updateExchangerConfiguration.bind(
          exchangerController,
        ),
      exchangerSetActive:
        exchangerController.setActive.bind(exchangerController),
      exchangerSetActiveDirection:
        exchangerController.setActiveDirection.bind(exchangerController),
      exchangerSettingRemove:
        exchangerController.exchangerSettingRemove.bind(exchangerController),
      exchangerRepeatExchange:
        exchangerController.repeatExchange.bind(exchangerController),
      exchangerRejectExchange:
        exchangerController.rejectExchange.bind(exchangerController),
      exchangerReserve: exchangerController.reserve.bind(exchangerController),
      exchangerUserConfirmation:
        exchangerController.userConfirmDirection.bind(exchangerController),
      refundSwap:
        exchangerController.createRefundSafeTransaction.bind(
          exchangerController,
        ),

      // DextradeController
      dextradeRequest: dextradeController.request.bind(dextradeController),
      savePaymentMethod:
        dextradeController.savePaymentMethod.bind(dextradeController),
      removePaymentMethod:
        dextradeController.removePaymentMethod.bind(dextradeController),
      dextradeRefreshApiKey:
        dextradeController.refreshApiKey.bind(dextradeController),
      dextradeSetShowRelogin:
        dextradeController.setShowRelogin.bind(dextradeController),

      // MULTISIGNER CREATOR CONTROLLER
      multisignMount: multisignerController.creatorController.mount.bind(
        multisignerController.creatorController,
      ),
      multisignUnmount: multisignerController.creatorController.unmount.bind(
        multisignerController.creatorController,
      ),
      multisignSetToken: multisignerController.creatorController.setToken.bind(
        multisignerController.creatorController,
      ),
      multisignSetTokenScript:
        multisignerController.creatorController.setTokenScript.bind(
          multisignerController.creatorController,
        ),
      // MULTISIGNER CONTROLLER
      multisignGenerate: multisignerController.generate.bind(
        multisignerController,
      ),
      multisignAdd: multisignerController.add.bind(multisignerController),
      multisignRemove: multisignerController.remove.bind(multisignerController),
      multisignTransactionWeight: multisignerController.transactionWeight.bind(
        multisignerController,
      ),
      multisignTransactionCreate: multisignerController.transactionCreate.bind(
        multisignerController,
      ),
      multisignTransactionSign: multisignerController.transactionSign.bind(
        multisignerController,
      ),
      multisignTransactionDecline:
        multisignerController.transactionDecline.bind(multisignerController),

      // swaps
      fetchAndSetQuotes:
        swapsController.fetchAndSetQuotes.bind(swapsController),
      p2pExchangesFilter:
        swapsController.p2pExchangesFilter.bind(swapsController),
      p2pExchangesStart:
        swapsController.clientP2PExchangeStart.bind(swapsController),
      setSelectedQuoteAggId:
        swapsController.setSelectedQuoteAggId.bind(swapsController),
      resetSwapsState: swapsController.resetSwapsState.bind(swapsController),
      setSwapsTokens: swapsController.setSwapsTokens.bind(swapsController),
      clearSwapsQuotes: swapsController.clearSwapsQuotes.bind(swapsController),
      setApproveTxId: swapsController.setApproveTxId.bind(swapsController),
      setTradeTxId: swapsController.setTradeTxId.bind(swapsController),
      setSwapsTxGasPrice:
        swapsController.setSwapsTxGasPrice.bind(swapsController),
      setSwapsTxGasLimit:
        swapsController.setSwapsTxGasLimit.bind(swapsController),
      setSwapsTxMaxFeePerGas:
        swapsController.setSwapsTxMaxFeePerGas.bind(swapsController),
      setSwapsTxMaxFeePriorityPerGas:
        swapsController.setSwapsTxMaxFeePriorityPerGas.bind(swapsController),
      safeRefetchQuotes:
        swapsController.safeRefetchQuotes.bind(swapsController),
      stopPollingForQuotes:
        swapsController.stopPollingForQuotes.bind(swapsController),
      setBackgroundSwapRouteState:
        swapsController.setBackgroundSwapRouteState.bind(swapsController),
      resetPostFetchState:
        swapsController.resetPostFetchState.bind(swapsController),
      setSwapsErrorKey: swapsController.setSwapsErrorKey.bind(swapsController),
      setInitialGasEstimate:
        swapsController.setInitialGasEstimate.bind(swapsController),
      setCustomApproveTxData:
        swapsController.setCustomApproveTxData.bind(swapsController),
      setSwapsLiveness: swapsController.setSwapsLiveness.bind(swapsController),
      setSwapsFeatureFlags:
        swapsController.setSwapsFeatureFlags.bind(swapsController),
      setSwapsUserFeeLevel:
        swapsController.setSwapsUserFeeLevel.bind(swapsController),
      setSwapsQuotesPollingLimitEnabled:
        swapsController.setSwapsQuotesPollingLimitEnabled.bind(swapsController),

      // OTC/DEX SWAP EXCHANGER
      swapGetOtcRates: swapsController.swapsExchanger.getOtcRates.bind(
        swapsController.swapsExchanger,
      ),
      swapGetDexRates: swapsController.swapsExchanger.getDexRates.bind(
        swapsController.swapsExchanger,
      ),
      swapOtcExchangesStart:
        swapsController.swapsExchanger.swapOtcExchangesStart.bind(
          swapsController.swapsExchanger,
        ),
      swapOtcExchangesGetById:
        swapsController.swapsExchanger.swapOtcExchangesGetById.bind(
          swapsController.swapsExchanger,
        ),
      swapExchangerGetAllowance:
        swapsController.swapsExchanger.swapExchangerGetAllowance.bind(
          swapsController.swapsExchanger,
        ),
      swapExchangerApprove:
        swapsController.swapsExchanger.swapExchangerApprove.bind(
          swapsController.swapsExchanger,
        ),
      swapExchangerByProvider:
        swapsController.swapsExchanger.swapExchangerByProvider.bind(
          swapsController.swapsExchanger,
        ),

      // WalletConnect
      walletConnect: walletConnectController.connect.bind(
        walletConnectController,
      ),

      // Smart Transactions
      // setSmartTransactionsOptInStatus:
      //   smartTransactionsController.setOptInState.bind(
      //     smartTransactionsController,
      //   ),
      // fetchSmartTransactionFees: smartTransactionsController.getFees.bind(
      //   smartTransactionsController,
      // ),
      // clearSmartTransactionFees: smartTransactionsController.clearFees.bind(
      //   smartTransactionsController,
      // ),
      // submitSignedTransactions:
      //   smartTransactionsController.submitSignedTransactions.bind(
      //     smartTransactionsController,
      //   ),
      // cancelSmartTransaction:
      //   smartTransactionsController.cancelSmartTransaction.bind(
      //     smartTransactionsController,
      //   ),
      // fetchSmartTransactionsLiveness:
      //   smartTransactionsController.fetchLiveness.bind(
      //     smartTransactionsController,
      //   ),
      // updateSmartTransaction:
      //   smartTransactionsController.updateSmartTransaction.bind(
      //     smartTransactionsController,
      //   ),
      // setStatusRefreshInterval:
      //   smartTransactionsController.setStatusRefreshInterval.bind(
      //     smartTransactionsController,
      //   ),

      // MetaMetrics
      trackMetaMetricsEvent: metaMetricsController.trackEvent.bind(
        metaMetricsController,
      ),
      trackMetaMetricsPage: metaMetricsController.trackPage.bind(
        metaMetricsController,
      ),
      createEventFragment: metaMetricsController.createEventFragment.bind(
        metaMetricsController,
      ),
      updateEventFragment: metaMetricsController.updateEventFragment.bind(
        metaMetricsController,
      ),
      finalizeEventFragment: metaMetricsController.finalizeEventFragment.bind(
        metaMetricsController,
      ),

      // approval controller
      resolvePendingApproval: this.resolvePendingApproval,
      rejectPendingApproval: this.rejectPendingApproval,

      // Notifications
      updateViewedNotifications: announcementController.updateViewed.bind(
        announcementController,
      ),

      // GasFeeController
      getGasFeeEstimatesAndStartPolling:
        gasFeeController.getGasFeeEstimatesAndStartPolling.bind(
          gasFeeController,
        ),

      disconnectGasFeeEstimatePoller:
        gasFeeController.disconnectPoller.bind(gasFeeController),

      getGasFeeTimeEstimate:
        gasFeeController.getTimeEstimate.bind(gasFeeController),

      addPollingTokenToAppState:
        appStateController.addPollingToken.bind(appStateController),

      removePollingTokenFromAppState:
        appStateController.removePollingToken.bind(appStateController),

      // BackupController
      backupUserData: backupController.backupUserData.bind(backupController),
      restoreUserData: backupController.restoreUserData.bind(backupController),

      // DetectTokenController
      detectNewTokens: detectTokensController.detectNewTokens.bind(
        detectTokensController,
      ),

      // DetectCollectibleController
      // detectNfts: nftDetectionController.detectNfts.bind(
      //   nftDetectionController,
      // ),

      /** Token Detection V2 */
      addDetectedTokens:
        tokensController.addDetectedTokens.bind(tokensController),
      ignoreTokens: tokensController.ignoreTokens.bind(tokensController),
      // getBalancesInSingleCall:
      //   assetsContractController.getBalancesInSingleCall.bind(
      //     assetsContractController,
      //   ),
    };
  }

  async exportAccount(address, password) {
    await this.verifyPassword(password);
    return this.keyringController.exportAccount(address, password);
  }

  async getTokenStandardAndDetails(localId, userAddress, tokenId) {
    const [chainId, contract] = localId.split(':');
    const controller = this.chainsController.getControllerByChainId(chainId);

    if (controller.assetsContractController) {
      const tokenInfo =
        await controller.assetsContractController.getTokenStandardAndDetails(
          contract,
          userAddress || controller.getCurrentAccount().nativeAddress,
          tokenId,
        );
      return tokenInfo;
    }
    throw new Error(
      `getTokenStandardAndDetails - Chain ${chainId} is not support this functionality`,
    );
  }

  //=============================================================================
  // VAULT / KEYRING RELATED METHODS
  //=============================================================================

  /**
   * Creates a new Vault and create a new keychain.
   *
   * A vault, or KeyringController, is a controller that contains
   * many different account strategies, currently called Keyrings.
   * Creating it new means wiping all previous keyrings.
   *
   * A keychain, or keyring, controls many accounts with a single backup and signing strategy.
   * For example, a mnemonic phrase can generate many accounts, and is a keyring.
   *
   * @param {string} password
   * @returns {object} vault
   */
  async createNewVaultAndKeychain(password) {
    const releaseLock = await this.createVaultMutex.acquire();
    try {
      let vault;
      const accounts = await this.keyringController.getAccounts();
      if (accounts.length > 0) {
        vault = await this.keyringController.fullUpdate();
      } else {
        vault = await this.keyringController.createNewVaultAndKeychain(
          password,
        );
        const addresses = await this.keyringController.getAccounts();
        this.preferencesController.setAddresses(addresses);
        this.selectFirstIdentity();
        this.initActiveChainsTokens();
      }

      return vault;
    } finally {
      releaseLock();
    }
  }

  /**
   * Create a new Vault and restore an existent keyring.
   *
   * @param {string} password
   * @param {number[]} encodedSeedPhrase - The seed phrase, encoded as an array
   * of UTF-8 bytes.
   */
  async createNewVaultAndRestore(password, encodedSeedPhrase) {
    const releaseLock = await this.createVaultMutex.acquire();
    try {
      let accounts, lastBalance;

      const seedPhraseAsBuffer = Buffer.from(encodedSeedPhrase);

      const { keyringController } = this;

      // clear known identities
      this.preferencesController.setAddresses([]);

      // clear permissions
      this.permissionController.clearState();

      ///: BEGIN:ONLY_INCLUDE_IN(flask)
      // Clear snap state
      // this.snapController.clearState();
      // // Clear notification state
      // this.notificationController.clear();
      ///: END:ONLY_INCLUDE_IN

      // clear cachedBalances
      // this.cachedBalancesController.clearCachedBalances();

      // clear unapproved transactions
      this.txController.txStateManager.clearUnapprovedTxs();

      // create new vault
      const vault = await keyringController.createNewVaultAndRestore(
        password,
        seedPhraseAsBuffer,
      );

      // const ethQuery = new EthQuery(this.provider);
      accounts = await keyringController.getAccounts();
      lastBalance = await this.getBalance(accounts[accounts.length - 1]);

      const [primaryKeyring] = keyringController.getKeyringsByType(
        KeyringType.hdKeyTree,
      );
      if (!primaryKeyring) {
        throw new Error('MetamaskController - No HD Key Tree found');
      }

      // seek out the first zero balance
      while (lastBalance !== '0x0') {
        await keyringController.addNewAccount(primaryKeyring);
        accounts = await keyringController.getAccounts();
        lastBalance = await this.getBalance(accounts[accounts.length - 1]);
      }

      // remove extra zero balance account potentially created from seeking ahead
      if (accounts.length > 1 && lastBalance === '0x0') {
        await this.removeAccount(accounts[accounts.length - 1]);
        accounts = await keyringController.getAccounts();
      }

      // This must be set as soon as possible to communicate to the
      // keyring's iframe and have the setting initialized properly
      // Optimistically called to not block MetaMask login due to
      // Ledger Keyring GitHub downtime
      const transportPreference =
        this.preferencesController.getLedgerTransportPreference();
      this.setLedgerTransportPreference(transportPreference);

      // set new identities
      this.preferencesController.setAddresses(accounts);
      this.selectFirstIdentity();
      this.initActiveChainsTokens();

      return vault;
    } finally {
      releaseLock();
    }
  }

  /**
   * Deprecated in dextrade
   *
   * Get an account balance from the AccountTracker or request it directly from the network.
   *
   * old-param {string} address - The account address
   * old-param {EthQuery} ethQuery - The EthQuery instance to use when asking the network
   */
  getBalance() {
    return '0x0';
    // return new Promise((resolve, reject) => {
    //   const cached = this.accountTracker.store.getState().accounts[address];

    //   if (cached && cached.balance) {
    //     resolve(cached.balance);
    //   } else {
    //     ethQuery.getBalance(address, (error, balance) => {
    //       if (error) {
    //         reject(error);
    //         log.error(error);
    //       } else {
    //         resolve(balance || '0x0');
    //       }
    //     });
    //   }
    // });
  }

  /**
   * Collects all the information that we want to share
   * with the mobile client for syncing purposes
   *
   * @returns {Promise<object>} Parts of the state that we want to syncx
   */
  async fetchInfoToSync() {
    // Preferences
    const { currentLocale, identities, selectedAddress } =
      this.preferencesController.store.getState(); // useTokenDetection

    // const isTokenDetectionInactiveInMainnet =
    //   !useTokenDetection &&
    //   this.networkController.store.getState().provider.chainId ===
    //     CHAIN_IDS.MAINNET;

    const { networkConfigurations } = this.networkController.store.getState();

    // const { tokenList } = this.tokenListController.state;
    // const caseInSensitiveTokenList = isTokenDetectionInactiveInMainnet
    //   ? STATIC_MAINNET_TOKEN_LIST
    //   : tokenList;
    const caseInSensitiveTokenList = STATIC_MAINNET_TOKEN_LIST;

    const preferences = {
      currentLocale,
      identities,
      selectedAddress,
    };

    // Tokens
    const { allTokens, allIgnoredTokens } = this.tokensController.state;

    // Filter ERC20 tokens
    const allERC20Tokens = {};

    Object.keys(allTokens).forEach((chainId) => {
      allERC20Tokens[chainId] = {};
      Object.keys(allTokens[chainId]).forEach((accountAddress) => {
        const checksummedAccountAddress = toChecksumHexAddress(accountAddress);
        allERC20Tokens[chainId][checksummedAccountAddress] = allTokens[chainId][
          checksummedAccountAddress
        ].filter((asset) => {
          if (asset.isERC721 === undefined) {
            // the tokenList will be holding only erc20 tokens
            if (
              caseInSensitiveTokenList[asset.address?.toLowerCase()] !==
              undefined
            ) {
              return true;
            }
          } else if (asset.isERC721 === false) {
            return true;
          }
          return false;
        });
      });
    });

    // Accounts
    const [hdKeyring] = this.keyringController.getKeyringsByType(
      KeyringType.hdKeyTree,
    );
    const simpleKeyPairKeyrings = this.keyringController.getKeyringsByType(
      KeyringType.hdKeyTree,
    );
    const hdAccounts = await hdKeyring.getAccounts();
    const simpleKeyPairKeyringAccounts = await Promise.all(
      simpleKeyPairKeyrings.map((keyring) => keyring.getAccounts()),
    );
    const simpleKeyPairAccounts = simpleKeyPairKeyringAccounts.reduce(
      (acc, accounts) => [...acc, ...accounts],
      [],
    );
    const accounts = {
      hd: hdAccounts
        .filter((item, pos) => hdAccounts.indexOf(item) === pos)
        .map((address) => toChecksumHexAddress(address)),
      simpleKeyPair: simpleKeyPairAccounts
        .filter((item, pos) => simpleKeyPairAccounts.indexOf(item) === pos)
        .map((address) => toChecksumHexAddress(address)),
      ledger: [],
      trezor: [],
      lattice: [],
    };

    // transactions

    let { transactions } = this.txController.store.getState();
    // delete tx for other accounts that we're not importing
    transactions = Object.values(transactions).filter((tx) => {
      const checksummedTxFrom = toChecksumHexAddress(tx.txParams.from);
      return accounts.hd.includes(checksummedTxFrom);
    });

    return {
      accounts,
      preferences,
      transactions,
      tokens: { allTokens: allERC20Tokens, allIgnoredTokens },
      network: this.networkController.store.getState(),
      networkConfigurations,
    };
  }

  /**
   * Submits the user's password and attempts to unlock the vault.
   * Also synchronizes the preferencesController, to ensure its schema
   * is up to date with known accounts once the vault is decrypted.
   *
   * @param {string} password - The user's password
   * @returns {Promise<object>} The keyringController update.
   */
  async submitPassword(password) {
    await this.keyringController.submitPassword(password);
    // This must be set as soon as possible to communicate to the
    // keyring's iframe and have the setting initialized properly
    // Optimistically called to not block MetaMask login due to
    // Ledger Keyring GitHub downtime
    const transportPreference =
      this.preferencesController.getLedgerTransportPreference();

    this.setLedgerTransportPreference(transportPreference);

    return this.keyringController.fullUpdate();
  }

  async _loginUser() {
    try {
      // Automatic login via config password
      const password = process.env.DEFAULT_PASSWORD;
      if (password) {
        await this.submitPassword(password);
      }
      // Automatic login via storage encryption key
      else if (isManifestV3) {
        await this.submitEncryptionKey();
      }
    } finally {
      this._startUISync();
    }
  }

  _startUISync() {
    // Message startUISync is used in MV3 to start syncing state with UI
    // Sending this message after login is completed helps to ensure that incomplete state without
    // account details are not flushed to UI.
    this.emit('startUISync');
    this.startUISync = true;
    this.memStore.subscribe(this.sendUpdate.bind(this));
  }

  /**
   * Submits a user's encryption key to log the user in via login token
   */
  async submitEncryptionKey() {
    try {
      const { loginToken, loginSalt } = await browser.storage.session.get([
        'loginToken',
        'loginSalt',
      ]);
      if (loginToken && loginSalt) {
        const { vault } = this.keyringController.store.getState();

        const jsonVault = JSON.parse(vault);

        if (jsonVault.salt !== loginSalt) {
          console.warn(
            'submitEncryptionKey: Stored salt and vault salt do not match',
          );
          await this.clearLoginArtifacts();
          return;
        }

        await this.keyringController.submitEncryptionKey(loginToken, loginSalt);
      }
    } catch (e) {
      // If somehow this login token doesn't work properly,
      // remove it and the user will get shown back to the unlock screen
      await this.clearLoginArtifacts();
      throw e;
    }
  }

  async clearLoginArtifacts() {
    await browser.storage.session.remove(['loginToken', 'loginSalt']);
  }

  /**
   * Submits a user's password to check its validity.
   *
   * @param {string} password - The user's password
   */
  async verifyPassword(password) {
    await this.keyringController.verifyPassword(password);
  }

  /**
   * @type Identity
   * @property {string} name - The account nickname.
   * @property {string} address - The account's ethereum address, in lower case.
   * receiving funds from our automatic Ropsten faucet.
   */

  /**
   * Sets the first address in the state to the selected address
   */
  selectFirstIdentity() {
    const { identities } = this.preferencesController.store.getState();
    const [address] = Object.keys(identities);
    this.preferencesController.setSelectedAddress(address);
  }

  /**
   * Gets the mnemonic of the user's primary keyring.
   */
  getPrimaryKeyringMnemonic() {
    const [keyring] = this.keyringController.getKeyringsByType(
      KeyringType.hdKeyTree,
    );
    if (!keyring.mnemonic) {
      throw new Error('Primary keyring mnemonic unavailable.');
    }

    return keyring.mnemonic;
  }

  getCurrentKeyring() {
    const selectedAddress = this.preferencesController.getSelectedAddress();
    return this.keyringController.getKeyringForAccount(selectedAddress);
  }

  /**
   * Gets mnemonic in sha3-256 hash format
   *
   * @returns sha3-256 string
   */
  async generateWalletMnemonicHash() {
    const keyring = await this.getCurrentKeyring();
    const mnemonicString = await keyring
      .serialize()
      .then((v) => Buffer.from(v.mnemonic).toString());

    return generateMnemonicHash(mnemonicString);
  }

  async getAccountAddressByProvider(provider) {
    return this.chainsController
      .getControllerByProvider(provider)
      .getCurrentAccount().nativeAddress;
  }

  //
  // Hardware
  //

  async deriveHdKey(deriveIdx = 0) {
    const keyring = await this.getCurrentKeyring();
    return keyring.root.deriveChild(deriveIdx);
  }

  async getKeyringForDevice(deviceName, hdPath = null) {
    const keyringOverrides = this.opts.overrides?.keyrings;
    let keyringName = null;
    if (
      deviceName !== HardwareDeviceNames.QR &&
      !this.canUseHardwareWallets()
    ) {
      throw new Error('Hardware wallets are not supported on this version.');
    }
    switch (deviceName) {
      case HardwareDeviceNames.trezor:
        keyringName = keyringOverrides?.trezor?.type || TrezorKeyring.type;
        break;
      case HardwareDeviceNames.ledger:
        keyringName =
          keyringOverrides?.ledger?.type || LedgerBridgeKeyring.type;
        break;
      // case HardwareDeviceNames.qr:
      //   keyringName = QRHardwareKeyring.type;
      //   break;
      case HardwareDeviceNames.lattice:
        keyringName = keyringOverrides?.lattice?.type || LatticeKeyring.type;
        break;
      default:
        throw new Error(
          'MetamaskController:getKeyringForDevice - Unknown device',
        );
    }
    let [keyring] = await this.keyringController.getKeyringsByType(keyringName);
    if (!keyring) {
      keyring = await this.keyringController.addNewKeyring(keyringName);
    }
    if (hdPath && keyring.setHdPath) {
      keyring.setHdPath(hdPath);
    }
    if (deviceName === HardwareDeviceNames.lattice) {
      keyring.appName = 'MetaMask';
    }
    if (deviceName === HardwareDeviceNames.trezor) {
      const model = keyring.getModel();
      this.appStateController.setTrezorModel(model);
    }

    keyring.network = this.networkController.store.getState().provider.type;

    return keyring;
  }

  async attemptLedgerTransportCreation() {
    const keyring = await this.getKeyringForDevice(HardwareDeviceNames.ledger);
    return await keyring.attemptMakeApp();
  }

  async establishLedgerTransportPreference() {
    const transportPreference =
      this.preferencesController.getLedgerTransportPreference();
    return await this.setLedgerTransportPreference(transportPreference);
  }

  /**
   * Fetch account list from a trezor device.
   *
   * @param deviceName
   * @param page
   * @param hdPath
   * @returns [] accounts
   */
  async connectHardware(deviceName, page, hdPath) {
    const keyring = await this.getKeyringForDevice(deviceName, hdPath);
    let accounts = [];
    switch (page) {
      case -1:
        accounts = await keyring.getPreviousPage();
        break;
      case 1:
        accounts = await keyring.getNextPage();
        break;
      default:
        accounts = await keyring.getFirstPage();
    }

    // Merge with existing accounts
    // and make sure addresses are not repeated
    const oldAccounts = await this.keyringController.getAccounts();
    const accountsToTrack = [
      ...new Set(
        oldAccounts.concat(accounts.map((a) => a.address.toLowerCase())),
      ),
    ];
    this.accountTracker.syncWithAddresses(accountsToTrack);
    return accounts;
  }

  /**
   * Check if the device is unlocked
   *
   * @param deviceName
   * @param hdPath
   * @returns {Promise<boolean>}
   */
  async checkHardwareStatus(deviceName, hdPath) {
    const keyring = await this.getKeyringForDevice(deviceName, hdPath);
    return keyring.isUnlocked();
  }

  /**
   * Clear
   *
   * @param deviceName
   * @returns {Promise<boolean>}
   */
  async forgetDevice(deviceName) {
    const keyring = await this.getKeyringForDevice(deviceName);
    keyring.forgetDevice();
    return true;
  }

  /**
   * Retrieves the keyring for the selected address and using the .type returns
   * a subtype for the account. Either 'hardware', 'imported' or 'MetaMask'.
   *
   * @param {string} address - Address to retrieve keyring for
   * @returns {'hardware' | 'imported' | 'MetaMask'}
   */
  async getAccountType(address) {
    const keyring = await this.keyringController.getKeyringForAccount(address);
    switch (keyring.type) {
      case KeyringType.trezor:
      case KeyringType.lattice:
      case KeyringType.qr:
      case KeyringType.ledger:
        return 'hardware';
      case KeyringType.imported:
        return 'imported';
      default:
        return 'MetaMask';
    }
  }

  /**
   * Retrieves the keyring for the selected address and using the .type
   * determines if a more specific name for the device is available. Returns
   * 'N/A' for non hardware wallets.
   *
   * @param {string} address - Address to retrieve keyring for
   * @returns {'ledger' | 'lattice' | 'N/A' | string}
   */
  async getDeviceModel(address) {
    const keyring = await this.keyringController.getKeyringForAccount(address);
    switch (keyring.type) {
      case KeyringType.trezor:
        return keyring.getModel();
      case KeyringType.qr:
        return keyring.getName();
      case KeyringType.ledger:
        // TODO: get model after ledger keyring exposes method
        return HardwareDeviceNames.ledger;
      case KeyringType.lattice:
        // TODO: get model after lattice keyring exposes method
        return HardwareDeviceNames.lattice;
      default:
        return 'N/A';
    }
  }

  /**
   * get hardware account label
   *
   * @returns string label
   */

  getAccountLabel(name, index, hdPathDescription) {
    return `${name[0].toUpperCase()}${name.slice(1)} ${
      parseInt(index, 10) + 1
    } ${hdPathDescription || ''}`.trim();
  }

  /**
   * Imports an account from a Trezor or Ledger device.
   *
   * @param index
   * @param deviceName
   * @param hdPath
   * @param hdPathDescription
   * @returns {} keyState
   */
  async unlockHardwareWalletAccount(
    index,
    deviceName,
    hdPath,
    hdPathDescription,
  ) {
    const keyring = await this.getKeyringForDevice(deviceName, hdPath);

    keyring.setAccountToUnlock(index);
    const oldAccounts = await this.keyringController.getAccounts();
    const keyState = await this.keyringController.addNewAccount(keyring);
    const newAccounts = await this.keyringController.getAccounts();
    this.preferencesController.setAddresses(newAccounts);
    newAccounts.forEach((address) => {
      if (!oldAccounts.includes(address)) {
        const label = this.getAccountLabel(
          deviceName === HardwareDeviceNames.qr
            ? keyring.getName()
            : deviceName,
          index,
          hdPathDescription,
        );
        // Set the account label to Trezor 1 /  Ledger 1 / QR Hardware 1, etc
        this.preferencesController.setAccountLabel(address, label);
        // Select the account
        this.preferencesController.setSelectedAddress(address);
      }
    });

    const { identities } = this.preferencesController.store.getState();
    return { ...keyState, identities };
  }

  //
  // Account Management
  //

  /**
   * Create keyring with new mnemonic
   *
   * @param {string} seedPhrase - add by mnemonic, if not specified mnemonic will be generated automatically
   * @returns {} keyState
   */
  async addNewAccount(seedPhrase) {
    const primaryKeyring = await this.keyringController.addNewKeyring(
      KeyringType.hdKeyTree,
      seedPhrase
        ? {
            mnemonic: seedPhrase,
            numberOfAccounts: 1,
          }
        : {},
    );
    const [createdWalletAccount] = await primaryKeyring.getAccounts();
    const allAccounts = await this.keyringController.getAccounts();
    this.preferencesController.setAddresses(allAccounts);
    this.preferencesController.setSelectedAddress(createdWalletAccount);
    this.initActiveChainsTokens();
    const { identities } = this.preferencesController.store.getState();
    return { ...this.keyringController.memStore.getState(), identities };
  }

  /**
   * Verifies the validity of the current vault's seed phrase.
   *
   * Validity: seed phrase restores the accounts belonging to the current vault.
   *
   * Called when the first account is created and on unlocking the vault.
   *
   * @returns {Promise<number[]>} The seed phrase to be confirmed by the user,
   * encoded as an array of UTF-8 bytes.
   */
  async verifySeedPhrase() {
    const keyring = await this.getCurrentKeyring();
    if (!keyring) {
      throw new Error('MetamaskController - No HD Key Tree found');
    }

    const serialized = await keyring.serialize();
    const seedPhraseAsBuffer = Buffer.from(serialized.mnemonic);

    const accounts = await keyring.getAccounts();
    if (accounts.length < 1) {
      throw new Error('MetamaskController - No accounts found');
    }

    try {
      await seedPhraseVerifier.verifyAccounts(accounts, seedPhraseAsBuffer);
      return Array.from(seedPhraseAsBuffer.values());
    } catch (err) {
      log.error(err.message);
      throw err;
    }
  }

  /**
   * Clears the transaction history, to allow users to force-reset their nonces.
   * Mostly used in development environments, when networks are restarted with
   * the same network ID.
   *
   * @returns {Promise<string>} The current selected address.
   */
  async resetAccount() {
    const selectedAddress = this.preferencesController.getSelectedAddress();
    this.txController.wipeTransactions(selectedAddress);
    this.chainsController.wipeTransactions();
    this.networkController.resetConnection();

    return selectedAddress;
  }

  /**
   * Gets the permitted accounts for the specified origin. Returns an empty
   * array if no accounts are permitted.
   *
   * @param {string} origin - The origin whose exposed accounts to retrieve.
   * @param {boolean} [suppressUnauthorizedError] - Suppresses the unauthorized error.
   * @returns {Promise<string[]>} The origin's permitted accounts, or an empty
   * array.
   */
  async getPermittedAccounts(
    origin,
    { suppressUnauthorizedError = true } = {},
  ) {
    try {
      const accounts = await this.permissionController.executeRestrictedMethod(
        origin,
        RestrictedMethods.eth_accounts,
      );
      return accounts;
    } catch (error) {
      if (
        suppressUnauthorizedError &&
        error.code === rpcErrorCodes.provider.unauthorized
      ) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Stops exposing the account with the specified address to all third parties.
   * Exposed accounts are stored in caveats of the eth_accounts permission. This
   * method uses `PermissionController.updatePermissionsByCaveat` to
   * remove the specified address from every eth_accounts permission. If a
   * permission only included this address, the permission is revoked entirely.
   *
   * @param {string} targetAccount - The address of the account to stop exposing
   * to third parties.
   */
  removeAllAccountPermissions(targetAccount) {
    this.permissionController.updatePermissionsByCaveat(
      CaveatTypes.restrictReturnedAccounts,
      (existingAccounts) =>
        CaveatMutatorFactories[
          CaveatTypes.restrictReturnedAccounts
        ].removeAccount(targetAccount, existingAccounts),
    );
  }

  /**
   * Removes an account from state / storage.
   *
   * @param {string[]} address - A hex address
   */
  async removeAccount(address) {
    // Remove all associated permissions
    this.removeAllAccountPermissions(address);
    // Remove account from the preferences controller
    this.preferencesController.removeAddress(address);
    // Remove account from the account tracker controller
    this.accountTracker.removeAccount([address]);

    const keyring = await this.keyringController.getKeyringForAccount(address);
    // Remove account from the keyring
    await this.keyringController.removeAccount(address);
    const updatedKeyringAccounts = keyring ? await keyring.getAccounts() : {};
    if (updatedKeyringAccounts?.length === 0) {
      keyring.destroy?.();
    }

    return address;
  }

  /**
   * Imports an account with the specified import strategy.
   * These are defined in app/scripts/account-import-strategies
   * Each strategy represents a different way of serializing an Ethereum key pair.
   *
   * @param {string} strategy - A unique identifier for an account import strategy.
   * @param {any} args - The data required by that strategy to import an account.
   */
  async importAccountWithStrategy(strategy, args) {
    const privateKey = await accountImporter.importAccount(strategy, args);
    const keyring = await this.keyringController.addNewKeyring(
      KeyringType.imported,
      [privateKey],
    );
    const [firstAccount] = await keyring.getAccounts();
    // update accounts in preferences controller
    const allAccounts = await this.keyringController.getAccounts();
    this.preferencesController.setAddresses(allAccounts);
    // set new account as selected
    this.preferencesController.setSelectedAddress(firstAccount);
  }

  // ---------------------------------------------------------------------------
  // Identity Management (signature operations)

  /**
   * Called when a Dapp suggests a new tx to be signed.
   * this wrapper needs to exist so we can provide a reference to
   *  "newUnapprovedTransaction" before "txController" is instantiated
   *
   * @param {object} txParams - The transaction parameters.
   * @param {object} [req] - The original request, containing the origin.
   */
  async newUnapprovedTransaction(txParams, req) {
    if (!txParams.localId) {
      txParams.localId = this.chainsController.defaultChain;
    }
    return await this.txController.newUnapprovedTransaction(txParams, req);
  }

  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  /**
   * Gets an "app key" corresponding to an Ethereum address. An app key is more
   * or less an addrdess hashed together with some string, in this case a
   * subject identifier / origin.
   *
   * @todo Figure out a way to derive app keys that doesn't depend on the user's
   * Ethereum addresses.
   * @param {string} subject - The identifier of the subject whose app key to
   * retrieve.
   * @param {string} [requestedAccount] - The account whose app key to retrieve.
   * The first account in the keyring will be used by default.
   */
  async getAppKeyForSubject(subject, requestedAccount) {
    let account;

    if (requestedAccount) {
      account = requestedAccount;
    } else {
      [account] = await this.keyringController.getAccounts();
    }

    return this.keyringController.exportAppKeyForAddress(account, subject);
  }
  ///: END:ONLY_INCLUDE_IN

  // eth_decrypt methods

  /**
   * Called when a dapp uses the eth_decrypt method.
   *
   * @param {object} msgParams - The params of the message to sign & return to the Dapp.
   * @param {object} req - (optional) the original request, containing the origin
   * Passed back to the requesting Dapp.
   */
  async newRequestDecryptMessage(msgParams, req) {
    const promise = this.decryptMessageManager.addUnapprovedMessageAsync(
      msgParams,
      req,
    );
    this.sendUpdate();
    this.showUserConfirmation();
    return promise;
  }

  /**
   * Only decrypt message and don't touch transaction state
   *
   * @param {object} msgParams - The params of the message to decrypt.
   * @returns {Promise<object>} A full state update.
   */
  async decryptMessageInline(msgParams) {
    log.info('MetaMaskController - decryptMessageInline');
    // decrypt the message inline
    const msgId = msgParams.metamaskId;
    const msg = this.decryptMessageManager.getMsg(msgId);
    try {
      const stripped = stripHexPrefix(msgParams.data);
      const buff = Buffer.from(stripped, 'hex');
      msgParams.data = JSON.parse(buff.toString('utf8'));

      msg.rawData = await this.keyringController.decryptMessage(msgParams);
    } catch (e) {
      msg.error = e.message;
    }
    this.decryptMessageManager._updateMsg(msg);

    return this.getState();
  }

  /**
   * Signifies a user's approval to decrypt a message in queue.
   * Triggers decrypt, and the callback function from newUnsignedDecryptMessage.
   *
   * @param {object} msgParams - The params of the message to decrypt & return to the Dapp.
   * @returns {Promise<object>} A full state update.
   */
  async decryptMessage(msgParams) {
    log.info('MetaMaskController - decryptMessage');
    const msgId = msgParams.metamaskId;
    // sets the status op the message to 'approved'
    // and removes the metamaskId for decryption
    try {
      const cleanMsgParams = await this.decryptMessageManager.approveMessage(
        msgParams,
      );

      const stripped = stripHexPrefix(cleanMsgParams.data);
      const buff = Buffer.from(stripped, 'hex');
      cleanMsgParams.data = JSON.parse(buff.toString('utf8'));

      // decrypt the message
      const rawMess = await this.keyringController.decryptMessage(
        cleanMsgParams,
      );
      // tells the listener that the message has been decrypted and can be returned to the dapp
      this.decryptMessageManager.setMsgStatusDecrypted(msgId, rawMess);
    } catch (error) {
      log.info('MetaMaskController - eth_decrypt failed.', error);
      this.decryptMessageManager.errorMessage(msgId, error);
    }
    return this.getState();
  }

  /**
   * Used to cancel a eth_decrypt type message.
   *
   * @param {string} msgId - The ID of the message to cancel.
   */
  cancelDecryptMessage(msgId) {
    const messageManager = this.decryptMessageManager;
    messageManager.rejectMsg(msgId);
    return this.getState();
  }

  // eth_getEncryptionPublicKey methods

  /**
   * Called when a dapp uses the eth_getEncryptionPublicKey method.
   *
   * @param {object} msgParams - The params of the message to sign & return to the Dapp.
   * @param {object} req - (optional) the original request, containing the origin
   * Passed back to the requesting Dapp.
   */
  async newRequestEncryptionPublicKey(msgParams, req) {
    const address = msgParams;
    const keyring = await this.keyringController.getKeyringForAccount(address);

    switch (keyring.type) {
      case KeyringType.ledger: {
        return new Promise((_, reject) => {
          reject(
            new Error('Ledger does not support eth_getEncryptionPublicKey.'),
          );
        });
      }

      case KeyringType.trezor: {
        return new Promise((_, reject) => {
          reject(
            new Error('Trezor does not support eth_getEncryptionPublicKey.'),
          );
        });
      }

      case KeyringType.lattice: {
        return new Promise((_, reject) => {
          reject(
            new Error('Lattice does not support eth_getEncryptionPublicKey.'),
          );
        });
      }

      case KeyringType.qr: {
        return Promise.reject(
          new Error('QR hardware does not support eth_getEncryptionPublicKey.'),
        );
      }

      default: {
        const promise =
          this.encryptionPublicKeyManager.addUnapprovedMessageAsync(
            msgParams,
            req,
          );
        this.sendUpdate();
        this.showUserConfirmation();
        return promise;
      }
    }
  }

  /**
   * Signifies a user's approval to receiving encryption public key in queue.
   * Triggers receiving, and the callback function from newUnsignedEncryptionPublicKey.
   *
   * @param {object} msgParams - The params of the message to receive & return to the Dapp.
   * @returns {Promise<object>} A full state update.
   */
  async encryptionPublicKey(msgParams) {
    log.info('MetaMaskController - encryptionPublicKey');
    const msgId = msgParams.metamaskId;
    // sets the status op the message to 'approved'
    // and removes the metamaskId for decryption
    try {
      const params = await this.encryptionPublicKeyManager.approveMessage(
        msgParams,
      );

      // EncryptionPublicKey message
      const publicKey = await this.keyringController.getEncryptionPublicKey(
        params.data,
      );

      // tells the listener that the message has been processed
      // and can be returned to the dapp
      this.encryptionPublicKeyManager.setMsgStatusReceived(msgId, publicKey);
    } catch (error) {
      log.info(
        'MetaMaskController - eth_getEncryptionPublicKey failed.',
        error,
      );
      this.encryptionPublicKeyManager.errorMessage(msgId, error);
    }
    return this.getState();
  }

  /**
   * Used to cancel a eth_getEncryptionPublicKey type message.
   *
   * @param {string} msgId - The ID of the message to cancel.
   */
  cancelEncryptionPublicKey(msgId) {
    const messageManager = this.encryptionPublicKeyManager;
    messageManager.rejectMsg(msgId);
    return this.getState();
  }

  /**
   * @returns {boolean} true if the keyring type supports EIP-1559
   */
  async getCurrentAccountEIP1559Compatibility() {
    return true;
  }

  //=============================================================================
  // END (VAULT / KEYRING RELATED METHODS)
  //=============================================================================

  /**
   * Allows a user to attempt to cancel a previously submitted transaction
   * by creating a new transaction.
   *
   * @param {number} originalTxId - the id of the txMeta that you want to
   *  attempt to cancel
   * @param {import(
   *  './controllers/transactions'
   * ).CustomGasSettings} [customGasSettings] - overrides to use for gas params
   *  instead of allowing this method to generate them
   * @param options
   * @returns {object} MetaMask state
   */
  async createCancelTransaction(originalTxId, customGasSettings, options) {
    await this.txController.createCancelTransaction(
      originalTxId,
      customGasSettings,
      options,
    );
    const state = this.getState();
    return state;
  }

  /**
   * Allows a user to attempt to speed up a previously submitted transaction
   * by creating a new transaction.
   *
   * @param {number} originalTxId - the id of the txMeta that you want to
   *  attempt to speed up
   * @param {import(
   *  './controllers/transactions'
   * ).CustomGasSettings} [customGasSettings] - overrides to use for gas params
   *  instead of allowing this method to generate them
   * @param options
   * @returns {object} MetaMask state
   */
  async createSpeedUpTransaction(originalTxId, customGasSettings, options) {
    await this.txController.createSpeedUpTransaction(
      originalTxId,
      customGasSettings,
      options,
    );
    const state = this.getState();
    return state;
  }

  estimateGas(estimateGasParams) {
    return new Promise((resolve, reject) => {
      return this.txController.txGasUtil.query.estimateGas(
        estimateGasParams,
        (err, res) => {
          if (err) {
            return reject(err);
          }

          return resolve(res.toString(16));
        },
      );
    });
  }

  //=============================================================================
  // PASSWORD MANAGEMENT
  //=============================================================================

  /**
   * Allows a user to begin the seed phrase recovery process.
   */
  markPasswordForgotten() {
    this.preferencesController.setPasswordForgotten(true);
    this.sendUpdate();
  }

  /**
   * Allows a user to end the seed phrase recovery process.
   */
  unMarkPasswordForgotten() {
    this.preferencesController.setPasswordForgotten(false);
    this.sendUpdate();
  }

  //=============================================================================
  // SETUP
  //=============================================================================

  /**
   * A runtime.MessageSender object, as provided by the browser:
   *
   * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/MessageSender
   * @typedef {object} MessageSender
   * @property {string} - The URL of the page or frame hosting the script that sent the message.
   */

  /**
   * A Snap sender object.
   *
   * @typedef {object} SnapSender
   * @property {string} snapId - The ID of the snap.
   */

  /**
   * Used to create a multiplexed stream for connecting to an untrusted context
   * like a Dapp or other extension.
   *
   * @param options - Options bag.
   * @param {ReadableStream} options.connectionStream - The Duplex stream to connect to.
   * @param {MessageSender | SnapSender} options.sender - The sender of the messages on this stream.
   * @param {string} [options.subjectType] - The type of the sender, i.e. subject.
   */
  setupUntrustedCommunication({ connectionStream, sender, subjectType }) {
    const { usePhishDetect } = this.preferencesController.store.getState();

    let _subjectType;
    if (subjectType) {
      _subjectType = subjectType;
    } else if (sender.id && sender.id !== this.extension.runtime.id) {
      _subjectType = SubjectType.Extension;
    } else {
      _subjectType = SubjectType.Website;
    }

    if (sender.url) {
      const { hostname } = new URL(sender.url);
      this.phishingController.maybeUpdateState();
      // Check if new connection is blocked if phishing detection is on
      const phishingTestResponse = this.phishingController.test(hostname);
      if (usePhishDetect && phishingTestResponse?.result) {
        this.sendPhishingWarning(connectionStream, hostname);
        this.metaMetricsController.trackEvent({
          event: EVENT_NAMES.PHISHING_PAGE_DISPLAYED,
          category: EVENT.CATEGORIES.PHISHING,
          properties: {
            url: hostname,
          },
        });
        return;
      }
    }

    // setup multiplexing
    const mux = setupMultiplex(connectionStream);

    // messages between inpage and background
    this.setupProviderConnection(
      mux.createStream('metamask-provider'),
      sender,
      _subjectType,
    );
  }

  /**
   * Used to create a multiplexed stream for connecting to a trusted context,
   * like our own user interfaces, which have the provider APIs, but also
   * receive the exported API from this controller, which includes trusted
   * functions, like the ability to approve transactions or sign messages.
   *
   * @param {*} connectionStream - The duplex stream to connect to.
   * @param {MessageSender} sender - The sender of the messages on this stream
   */
  setupTrustedCommunication(connectionStream, sender) {
    // setup multiplexing
    const mux = setupMultiplex(connectionStream);
    // connect features
    this.setupControllerConnection(mux.createStream('controller'));
    this.setupProviderConnection(
      mux.createStream('provider'),
      sender,
      SubjectType.Internal,
    );
  }

  /**
   * Used to create a multiplexed stream for connecting to the phishing warning page.
   *
   * @param options - Options bag.
   * @param {ReadableStream} options.connectionStream - The Duplex stream to connect to.
   */
  setupPhishingCommunication({ connectionStream }) {
    const { usePhishDetect } = this.preferencesController.store.getState();

    if (!usePhishDetect) {
      return;
    }

    // setup multiplexing
    const mux = setupMultiplex(connectionStream);
    const phishingStream = mux.createStream(PHISHING_SAFELIST);

    // set up postStream transport
    phishingStream.on(
      'data',
      createMetaRPCHandler(
        { safelistPhishingDomain: this.safelistPhishingDomain.bind(this) },
        phishingStream,
      ),
    );
  }

  /**
   * Called when we detect a suspicious domain. Requests the browser redirects
   * to our anti-phishing page.
   *
   * @private
   * @param {*} connectionStream - The duplex stream to the per-page script,
   * for sending the reload attempt to.
   * @param {string} hostname - The hostname that triggered the suspicion.
   */
  sendPhishingWarning(connectionStream, hostname) {
    const mux = setupMultiplex(connectionStream);
    const phishingStream = mux.createStream('phishing');
    phishingStream.write({ hostname });
  }

  setupControllerConnectionSpa(handleUpdate) {
    // report new active controller connection
    this.activeControllerConnections += 1;
    this.emit('controllerConnectionChanged', this.activeControllerConnections);
    this.on('update', (update) => handleUpdate(update, this.store.getState()));
  }

  /**
   * A method for providing our API over a stream using JSON-RPC.
   *
   * @param {*} outStream - The stream to provide our API over.
   */
  setupControllerConnection(outStream) {
    const api = this.getApi();

    // report new active controller connection
    this.activeControllerConnections += 1;
    this.emit('controllerConnectionChanged', this.activeControllerConnections);

    // set up postStream transport
    outStream.on(
      'data',
      createMetaRPCHandler(
        api,
        outStream,
        this.store,
        this.localStoreApiWrapper,
      ),
    );
    const handleUpdate = (update) => {
      if (outStream._writableState.ended) {
        return;
      }
      // send notification to client-side
      outStream.write({
        jsonrpc: '2.0',
        method: 'sendUpdate',
        params: [update],
      });
    };
    this.on('update', handleUpdate);
    const startUISync = () => {
      if (outStream._writableState.ended) {
        return;
      }
      // send notification to client-side
      outStream.write({
        jsonrpc: '2.0',
        method: 'startUISync',
      });
    };

    if (this.startUISync) {
      startUISync();
    } else {
      this.once('startUISync', startUISync);
    }

    outStream.on('end', () => {
      this.activeControllerConnections -= 1;
      this.emit(
        'controllerConnectionChanged',
        this.activeControllerConnections,
      );
      this.removeListener('update', handleUpdate);
    });
  }

  /**
   * A method for serving our ethereum provider over a given stream.
   *
   * @param {*} outStream - The stream to provide over.
   * @param {MessageSender | SnapSender} sender - The sender of the messages on this stream
   * @param {SubjectType} subjectType - The type of the sender, i.e. subject.
   */
  setupProviderConnection(outStream, sender, subjectType) {
    let origin;
    if (subjectType === SubjectType.Internal) {
      origin = ORIGIN_METAMASK;
    }
    ///: BEGIN:ONLY_INCLUDE_IN(flask)
    else if (subjectType === SubjectType.Snap) {
      origin = sender.snapId;
    }
    ///: END:ONLY_INCLUDE_IN
    else {
      origin = new URL(sender.url).origin;
    }

    if (sender.id && sender.id !== this.extension.runtime.id) {
      this.subjectMetadataController.addSubjectMetadata({
        origin,
        extensionId: sender.id,
        subjectType: SubjectType.Extension,
      });
    }

    let tabId;
    if (sender.tab && sender.tab.id) {
      tabId = sender.tab.id;
    }

    const engine = this.setupProviderEngine({
      origin,
      sender,
      subjectType,
      tabId,
    });

    // setup connection
    const providerStream = createEngineStream({ engine });

    const connectionId = this.addConnection(origin, { engine });

    pump(outStream, providerStream, outStream, (err) => {
      // handle any middleware cleanup
      engine._middleware.forEach((mid) => {
        if (mid.destroy && typeof mid.destroy === 'function') {
          mid.destroy();
        }
      });
      connectionId && this.removeConnection(origin, connectionId);
      if (err) {
        log.error(err);
      }
    });
  }

  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  /**
   * For snaps running in workers.
   *
   * @param snapId
   * @param connectionStream
   */
  setupSnapProvider(snapId, connectionStream) {
    this.setupUntrustedCommunication({
      connectionStream,
      sender: { snapId },
      subjectType: SubjectType.Snap,
    });
  }
  ///: END:ONLY_INCLUDE_IN

  /**
   * A method for creating a provider that is safely restricted for the requesting subject.
   *
   * @param {object} options - Provider engine options
   * @param {string} options.origin - The origin of the sender
   * @param {MessageSender | SnapSender} options.sender - The sender object.
   * @param {string} options.subjectType - The type of the sender subject.
   * @param {tabId} [options.tabId] - The tab ID of the sender - if the sender is within a tab
   */
  setupProviderEngine({ origin, subjectType, sender, tabId }) {
    // setup json rpc engine stack
    const engine = new JsonRpcEngine();
    const { blockTracker, provider } = this;

    // create filter polyfill middleware
    const filterMiddleware = createFilterMiddleware({ provider, blockTracker });

    // create subscription polyfill middleware
    const subscriptionManager = createSubscriptionManager({
      provider,
      blockTracker,
    });
    subscriptionManager.events.on('notification', (message) =>
      engine.emit('notification', message),
    );

    if (isManifestV3) {
      engine.push(createDupeReqFilterMiddleware());
    }

    // append origin to each request
    engine.push(createOriginMiddleware({ origin }));

    // append tabId to each request if it exists
    if (tabId) {
      engine.push(createTabIdMiddleware({ tabId }));
    }

    // logging
    engine.push(createLoggerMiddleware({ origin }));
    engine.push(this.permissionLogController.createMiddleware());

    engine.push(
      createRPCMethodTrackingMiddleware({
        trackEvent: this.metaMetricsController.trackEvent.bind(
          this.metaMetricsController,
        ),
        getMetricsState: this.metaMetricsController.store.getState.bind(
          this.metaMetricsController.store,
        ),
      }),
    );

    // onboarding
    if (subjectType === SubjectType.Website) {
      engine.push(
        createOnboardingMiddleware({
          location: sender.url,
          registerOnboarding: this.onboardingController.registerOnboarding,
        }),
      );
    }

    // Unrestricted/permissionless RPC method implementations
    engine.push(
      createMethodMiddleware({
        origin,

        subjectType,

        // Miscellaneous
        addSubjectMetadata:
          this.subjectMetadataController.addSubjectMetadata.bind(
            this.subjectMetadataController,
          ),
        getProviderState: this.getProviderState.bind(this),
        getUnlockPromise: this.appStateController.getUnlockPromise.bind(
          this.appStateController,
        ),
        handleWatchAssetRequest: this.tokensController.watchAsset.bind(
          this.tokensController,
        ),
        requestUserApproval:
          this.approvalController.addAndShowApprovalRequest.bind(
            this.approvalController,
          ),
        sendMetrics: this.metaMetricsController.trackEvent.bind(
          this.metaMetricsController,
        ),
        // Permission-related
        getAccounts: this.getPermittedAccounts.bind(this, origin),
        getPermissionsForOrigin: this.permissionController.getPermissions.bind(
          this.permissionController,
          origin,
        ),
        hasPermission: this.permissionController.hasPermission.bind(
          this.permissionController,
          origin,
        ),
        requestAccountsPermission:
          this.permissionController.requestPermissions.bind(
            this.permissionController,
            { origin },
            { eth_accounts: {} },
          ),
        requestPermissionsForOrigin:
          this.permissionController.requestPermissions.bind(
            this.permissionController,
            { origin },
          ),
        getCurrentChainId: () => this.chainsController.defaultChain,
        getCurrentRpcUrl: () =>
          this.chainsController.getDefaultController().rpcUrl,
        // network configuration-related
        getNetworkConfigurations: () =>
          this.networkController.store.getState().networkConfigurations,
        upsertNetworkConfiguration:
          this.chainsController.upsertNetworkConfiguration.bind(
            this.chainsController,
          ),
        setActiveNetwork: this.chainsController.setActiveChain.bind(
          this.chainsController,
        ),
        findNetworkConfigurationBy: this.findNetworkConfigurationBy.bind(this),
        setProviderType: this.networkController.setProviderType.bind(
          this.networkController,
        ),

        // Web3 shim-related
        getWeb3ShimUsageState: this.alertController.getWeb3ShimUsageState.bind(
          this.alertController,
        ),
        setWeb3ShimUsageRecorded:
          this.alertController.setWeb3ShimUsageRecorded.bind(
            this.alertController,
          ),
      }),
    );

    ///: BEGIN:ONLY_INCLUDE_IN(flask)
    engine.push(
      createSnapMethodMiddleware(subjectType === SubjectType.Snap, {
        getAppKey: this.getAppKeyForSubject.bind(this, origin),
        getUnlockPromise: this.appStateController.getUnlockPromise.bind(
          this.appStateController,
        ),
        getSnaps: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:getPermitted',
          origin,
        ),
        requestPermissions: async (requestedPermissions) => {
          const [approvedPermissions] =
            await this.permissionController.requestPermissions(
              { origin },
              requestedPermissions,
            );

          return Object.values(approvedPermissions);
        },
        getPermissions: this.permissionController.getPermissions.bind(
          this.permissionController,
          origin,
        ),
        getAccounts: this.getPermittedAccounts.bind(this, origin),
        installSnaps: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:install',
          origin,
        ),
      }),
    );
    ///: END:ONLY_INCLUDE_IN

    // filter and subscription polyfills
    engine.push(filterMiddleware);
    engine.push(subscriptionManager.middleware);
    if (subjectType !== SubjectType.Internal) {
      // permissions
      engine.push(
        this.permissionController.createPermissionMiddleware({
          origin,
        }),
      );
    }

    engine.push(this.metamaskMiddleware);

    const defaultChain = this.chainsController.getDefaultController();

    if (defaultChain) {
      engine.push(
        providerAsMiddleware(
          defaultChain.getProviderAndBlockTracker().provider,
        ),
      );
    }
    return engine;
  }

  /**
   * Adds a reference to a connection by origin. Ignores the 'metamask' origin.
   * Caller must ensure that the returned id is stored such that the reference
   * can be deleted later.
   *
   * @param {string} origin - The connection's origin string.
   * @param {object} options - Data associated with the connection
   * @param {object} options.engine - The connection's JSON Rpc Engine
   * @returns {string} The connection's id (so that it can be deleted later)
   */
  addConnection(origin, { engine }) {
    if (origin === ORIGIN_METAMASK) {
      return null;
    }

    if (!this.connections[origin]) {
      this.connections[origin] = {};
    }

    const id = nanoid();
    this.connections[origin][id] = {
      engine,
    };

    return id;
  }

  /**
   * Deletes a reference to a connection, by origin and id.
   * Ignores unknown origins.
   *
   * @param {string} origin - The connection's origin string.
   * @param {string} id - The connection's id, as returned from addConnection.
   */
  removeConnection(origin, id) {
    const connections = this.connections[origin];
    if (!connections) {
      return;
    }

    delete connections[id];

    if (Object.keys(connections).length === 0) {
      delete this.connections[origin];
    }
  }

  /**
   * Closes all connections for the given origin, and removes the references
   * to them.
   * Ignores unknown origins.
   *
   * @param {string} origin - The origin string.
   */
  removeAllConnections(origin) {
    const connections = this.connections[origin];
    if (!connections) {
      return;
    }

    Object.keys(connections).forEach((id) => {
      this.removeConnection(origin, id);
    });
  }

  /**
   * Causes the RPC engines associated with the connections to the given origin
   * to emit a notification event with the given payload.
   *
   * The caller is responsible for ensuring that only permitted notifications
   * are sent.
   *
   * Ignores unknown origins.
   *
   * @param {string} origin - The connection's origin string.
   * @param {unknown} payload - The event payload.
   */
  notifyConnections(origin, payload) {
    const connections = this.connections[origin];

    if (connections) {
      Object.values(connections).forEach((conn) => {
        if (conn.engine) {
          conn.engine.emit('notification', payload);
        }
      });
    }
  }

  /**
   * Causes the RPC engines associated with all connections to emit a
   * notification event with the given payload.
   *
   * If the "payload" parameter is a function, the payload for each connection
   * will be the return value of that function called with the connection's
   * origin.
   *
   * The caller is responsible for ensuring that only permitted notifications
   * are sent.
   *
   * @param {unknown} payload - The event payload, or payload getter function.
   */
  notifyAllConnections(payload) {
    const getPayload =
      typeof payload === 'function'
        ? (origin) => payload(origin)
        : () => payload;

    Object.keys(this.connections).forEach((origin) => {
      Object.values(this.connections[origin]).forEach(async (conn) => {
        if (conn.engine) {
          conn.engine.emit('notification', await getPayload(origin));
        }
      });
    });
  }

  // handlers

  /**
   * Handle a KeyringController update
   *
   * @param {object} state - the KC state
   * @returns {Promise<void>}
   * @private
   */
  async _onKeyringControllerUpdate(state) {
    const {
      keyrings,
      encryptionKey: loginToken,
      encryptionSalt: loginSalt,
    } = state;
    const addresses = keyrings.reduce(
      (acc, { accounts, session }) =>
        acc.concat(accounts.map((address) => ({ address, session }))),
      [],
    );

    if (isManifestV3) {
      await browser.storage.session.set({ loginToken, loginSalt });
    }

    if (!addresses.length) {
      return;
    }

    // Ensure preferences + identities controller know about all addresses
    this.preferencesController.syncAddresses(
      addresses.map(({ address }) => address),
    );
    this.preferencesController.syncSessions(addresses);
    // this.accountTracker.syncWithAddresses(addresses);
  }

  /**
   * Handle global application unlock.
   * Notifies all connections that the extension is unlocked, and which
   * account(s) are currently accessible, if any.
   */
  _onUnlock() {
    this.notifyAllConnections(async (origin) => {
      return {
        method: NOTIFICATION_NAMES.unlockStateChanged,
        params: {
          isUnlocked: true,
          accounts: await this.getPermittedAccounts(origin),
        },
      };
    });

    this.unMarkPasswordForgotten();

    // In the current implementation, this handler is triggered by a
    // KeyringController event. Other controllers subscribe to the 'unlock'
    // event of the MetaMaskController itself.
    this.emit('unlock');
  }

  /**
   * Handle global application lock.
   * Notifies all connections that the extension is locked.
   */
  _onLock() {
    this.notifyAllConnections({
      method: NOTIFICATION_NAMES.unlockStateChanged,
      params: {
        isUnlocked: false,
      },
    });

    // In the current implementation, this handler is triggered by a
    // KeyringController event. Other controllers subscribe to the 'lock'
    // event of the MetaMaskController itself.
    this.emit('lock');
  }

  /**
   * Handle memory state updates.
   * - Ensure isClientOpenAndUnlocked is updated
   * - Notifies all connections with the new provider network state
   *   - The external providers handle diffing the state
   *
   * @param newState
   */
  _onStateUpdate(newState) {
    this.isClientOpenAndUnlocked = newState.isUnlocked && this._isClientOpen;
    this.notifyAllConnections({
      method: NOTIFICATION_NAMES.chainChanged,
      params: this.getProviderNetworkState(newState),
    });
  }

  // misc

  /**
   * A method for emitting the full MetaMask state to all registered listeners.
   *
   * @private
   */
  privateSendUpdate() {
    this.emit('update', this.getState());
  }

  /**
   * @returns {boolean} Whether the extension is unlocked.
   */
  isUnlocked() {
    return this.keyringController.memStore.getState().isUnlocked;
  }

  //=============================================================================
  // MISCELLANEOUS
  //=============================================================================

  getExternalPendingTransactions() {
    return [];
    // return this.smartTransactionsController.getTransactions({
    //   addressFrom: address,
    //   status: 'pending',
    // });
  }

  /**
   * Returns the nonce that will be associated with a transaction once approved
   *
   * @param {string} address - The hex string address for the transaction
   * @returns {Promise<number>}
   */
  async getPendingNonce(address) {
    // WARN: Dextrade nonce tracker deprecated
    const { nonceDetails, releaseLock } =
      await this.txController.nonceTracker.getNonceLock(address);
    const pendingNonce = nonceDetails.params.highestSuggested;

    releaseLock();
    return pendingNonce;
  }

  /**
   * Returns the next nonce according to the nonce-tracker
   *
   * @param {string} address - The hex string address for the transaction
   * @returns {Promise<number>}
   */
  async getNextNonce(address) {
    // WARN: Dextrade nonce tracker deprecated
    const nonceLock = await this.txController.nonceTracker.getNonceLock(
      address,
    );
    nonceLock.releaseLock();
    return nonceLock.nextNonce;
  }

  //=============================================================================
  // CONFIG
  //=============================================================================

  /**
   * Returns the first network configuration object that matches at least one field of the
   * provided search criteria. Returns null if no match is found
   *
   * @param {object} rpcInfo - The RPC endpoint properties and values to check.
   * @returns {object} rpcInfo found in the network configurations list
   */
  findNetworkConfigurationBy(rpcInfo) {
    const networkConfigurations = Object.values(
      this.chainsController.store.getState().usedNetworks,
    ).map(({ config }) => config);
    const networkConfiguration = networkConfigurations.find((configuration) => {
      return Object.keys(rpcInfo).some((key) => {
        return configuration[key] === rpcInfo[key];
      });
    });

    return networkConfiguration || null;
  }

  // For p2p server compatibility
  async convertCoinToAsset({ ticker, networkName }) {
    let foundAsset;
    if (networkName === NetworkNames.fiat) {
      return this.getAssetModelBackground(ticker);
    }

    const { usedNetworks } = this.chainsController.store.getState();
    const nativeTokens = Object.values(usedNetworks).map(
      ({ config }) => getSharedProvider(config).nativeToken,
    );

    foundAsset = nativeTokens.find(
      (t) =>
        t.symbol === ticker &&
        CHAIN_ID_TO_NETWORK_MAP[t.localId] === networkName,
    );
    if (foundAsset) {
      return this.getAssetModelBackground(foundAsset);
    }

    const tokenRegistry = await fetchTokensRegistry();
    foundAsset = Object.values(tokenRegistry).find(
      (t) => t.symbol === ticker && t.network === networkName,
    );
    if (!foundAsset) {
      throw new Error('convertCoinToAsset - asset not found');
    }
    return this.getAssetModelBackground(foundAsset);
  }

  getAssetModelBackground(asset, options) {
    return new AssetModel(asset, {
      ...options,
      getState: this.getState.bind(this),
      getApi: this.getApi.bind(this),
    });
  }

  /**
   * Sets the Ledger Live preference to use for Ledger hardware wallet support
   *
   * @param {string} transportType - The Ledger transport type.
   */
  async setLedgerTransportPreference(transportType) {
    if (!this.canUseHardwareWallets()) {
      return undefined;
    }

    const currentValue =
      this.preferencesController.getLedgerTransportPreference();
    const newValue =
      this.preferencesController.setLedgerTransportPreference(transportType);

    const keyring = await this.getKeyringForDevice(HardwareDeviceNames.ledger);
    if (keyring?.updateTransportMethod) {
      return keyring.updateTransportMethod(newValue).catch((e) => {
        // If there was an error updating the transport, we should
        // fall back to the original value
        this.preferencesController.setLedgerTransportPreference(currentValue);
        throw e;
      });
    }

    return undefined;
  }

  /**
   * A method for initializing storage the first time.
   *
   * @param {object} initState - The default state to initialize with.
   * @private
   */
  recordFirstTimeInfo(initState) {
    if (!('firstTimeInfo' in initState)) {
      const version = this.platform.getVersion();
      initState.firstTimeInfo = {
        version,
        date: Date.now(),
      };
    }
  }

  // TODO: Replace isClientOpen methods with `controllerConnectionChanged` events.
  /* eslint-disable accessor-pairs */
  /**
   * A method for recording whether the MetaMask user interface is open or not.
   *
   * @param {boolean} open
   */
  set isClientOpen(open) {
    this._isClientOpen = open;
    this.detectTokensController.isOpen = open;
  }
  /* eslint-enable accessor-pairs */

  /**
   * A method that is called by the background when all instances of metamask are closed.
   * Currently used to stop polling in the gasFeeController.
   */
  onClientClosed() {
    try {
      this.gasFeeController.stopPolling();
      this.appStateController.clearPollingTokens();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * A method that is called by the background when a particular environment type is closed (fullscreen, popup, notification).
   * Currently used to stop polling in the gasFeeController for only that environement type
   *
   * @param environmentType
   */
  onEnvironmentTypeClosed(environmentType) {
    const appStatePollingTokenType =
      POLLING_TOKEN_ENVIRONMENT_TYPES[environmentType];
    const pollingTokensToDisconnect =
      this.appStateController.store.getState()[appStatePollingTokenType];
    pollingTokensToDisconnect.forEach((pollingToken) => {
      this.gasFeeController.disconnectPoller(pollingToken);
      this.appStateController.removePollingToken(
        pollingToken,
        appStatePollingTokenType,
      );
    });
  }

  /**
   * Adds a domain to the PhishingController safelist
   *
   * @param {string} hostname - the domain to safelist
   */
  safelistPhishingDomain(hostname) {
    return this.phishingController.bypass(hostname);
  }

  /**
   * Locks MetaMask
   */
  setLocked() {
    const [trezorKeyring] = this.keyringController.getKeyringsByType(
      KeyringType.trezor,
    );
    if (trezorKeyring) {
      trezorKeyring.dispose();
    }

    const [ledgerKeyring] = this.keyringController.getKeyringsByType(
      KeyringType.ledger,
    );
    ledgerKeyring?.destroy?.();

    if (isManifestV3) {
      this.clearLoginArtifacts();
    }

    return this.keyringController.setLocked();
  }

  removePermissionsFor = (subjects) => {
    try {
      this.permissionController.revokePermissions(subjects);
    } catch (exp) {
      if (!(exp instanceof PermissionsRequestNotFoundError)) {
        throw exp;
      }
    }
  };

  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  updateCaveat = (origin, target, caveatType, caveatValue) => {
    try {
      this.controllerMessenger.call(
        'PermissionController:updateCaveat',
        origin,
        target,
        caveatType,
        caveatValue,
      );
    } catch (exp) {
      if (!(exp instanceof PermissionsRequestNotFoundError)) {
        throw exp;
      }
    }
  };
  ///: END:ONLY_INCLUDE_IN

  rejectPermissionsRequest = (requestId) => {
    try {
      this.permissionController.rejectPermissionsRequest(requestId);
    } catch (exp) {
      if (!(exp instanceof PermissionsRequestNotFoundError)) {
        throw exp;
      }
    }
  };

  acceptPermissionsRequest = (request) => {
    try {
      this.permissionController.acceptPermissionsRequest(request);
    } catch (exp) {
      if (!(exp instanceof PermissionsRequestNotFoundError)) {
        throw exp;
      }
    }
  };

  resolvePendingApproval = (id, value, options) => {
    try {
      this.approvalController.accept(id, value, options);
    } catch (exp) {
      if (!(exp instanceof ApprovalRequestNotFoundError)) {
        throw exp;
      }
    }
  };

  rejectPendingApproval = (id, error) => {
    try {
      this.approvalController.reject(
        id,
        new EthereumRpcError(error.code, error.message, error.data),
      );
    } catch (exp) {
      if (!(exp instanceof ApprovalRequestNotFoundError)) {
        throw exp;
      }
    }
  };

  async securityProviderRequest(requestData, methodName) {
    const { currentLocale, transactionSecurityCheckEnabled } =
      this.preferencesController.store.getState();

    const chainId = Number(
      hexToDecimal(this.networkController.store.getState().provider.chainId),
    );

    if (transactionSecurityCheckEnabled) {
      try {
        const securityProviderResponse = await securityProviderCheck(
          requestData,
          methodName,
          chainId,
          currentLocale,
        );

        return securityProviderResponse;
      } catch (err) {
        log.error(err.message);
        throw err;
      }
    }

    return null;
  }

  async initActiveChainsTokens() {
    if (this.chainsController.isInitialized()) {
      const chainTokens = Object.values(
        this.chainsController.activeControllers,
      ).map((c) => c.sharedProvider.nativeToken);
      this.tokensController.initTokens(chainTokens);
    }
  }
}
