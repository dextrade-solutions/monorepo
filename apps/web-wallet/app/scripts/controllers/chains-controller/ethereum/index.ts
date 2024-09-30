import Eth from 'ethjs';
import EthContract from 'ethjs-contract';
import tokenAbi from 'human-standard-token-abi';
import { publicToAddress, arrToBufArr, addHexPrefix } from 'ethereumjs-util';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { createEventEmitterProxy } from 'swappable-obj-proxy';

import type { Hex } from '@metamask/utils';
import type { SafeEventEmitterProvider } from '@metamask/eth-json-rpc-provider';
import { KeyringController } from '@metamask/eth-keyring-controller';
import { encodeFunctionData } from 'viem';
import { ChainControllerOptions } from '../types';
import BaseController from '../base';
import ChainsController from '../interface';
import {
  isBurnAddress,
  isValidHexAddress,
} from '../../../../../shared/modules/hexstring-utils';
import {
  AtomicSafe,
  TxReceipt,
} from '../../../../../shared/constants/transaction';
import {
  AssetsContractController,
  NftController,
  NftDetectionController,
} from '../../../../overrided-metamask/assets-controllers';
import { TransactionMeta } from '../../transactions';
import {
  ATOMIC_SWAP_ABI,
  NULLISH_TOKEN_ADDRESS,
  getAtomicSwapId,
} from '../../../../../shared/lib/atomic-swaps';
import { BUILT_IN_NETWORKS } from '../../../../../shared/constants/network';
import IncomingTransactionsController from './incoming-transactions';
import TxController from './tx-controller';
import {
  ProxyWithAccessibleTarget,
  createAutoManagedNetworkClient,
} from './create-auto-managed-network-client';
import { NetworkClientType } from './types';

export type Provider = SafeEventEmitterProvider;

export type BlockTracker = {
  checkForLatestBlock(): Promise<string>;
};

/**
 * A configuration object that can be used to create a client for a custom
 * network.
 */
export type NetworkClientConfiguration = {
  chainId: Hex;
  rpcUrl: string;
  ticker: string;
};

/**
 * An object that provides the same interface as a network client but where the
 * network client is not initialized until either the provider or block tracker
 * is first accessed.
 */
export type AutoManagedNetworkClient<
  Configuration extends NetworkClientConfiguration,
> = {
  configuration: Configuration;
  provider: ProxyWithAccessibleTarget<Provider>;
  blockTracker: ProxyWithAccessibleTarget<BlockTracker>;
  destroy: () => void;
};

export default class EthereumController
  extends BaseController
  implements ChainsController
{
  ethQuery?: any;

  incomingTransactionsController: any;

  txController: TxController;

  keyringController: KeyringController;

  assetsContractController: AssetsContractController;

  nftController: NftController;

  nftDetectionController: NftDetectionController;

  #providerProxy: any | undefined;

  #blockTrackerProxy: any | undefined;

  #autoManagedNetworkClient: AutoManagedNetworkClient<NetworkClientConfiguration> | null;

  constructor(opts: ChainControllerOptions) {
    super(opts);

    this.keyringController = opts.keyringController;

    const providerConfig = {
      chainId: this.chainId,
      rpcUrl: this.rpcUrl,
      ticker: this.sharedProvider.nativeToken.symbol,
      type: NetworkClientType.Custom,
    };
    this.#autoManagedNetworkClient =
      createAutoManagedNetworkClient(providerConfig);
    this.#applyNetworkSelection();

    this.assetsContractController = new AssetsContractController(
      {
        onPreferencesStateChange: (listener) =>
          this.preferencesController.store.subscribe(listener),
      },
      {
        provider: this.#providerProxy,
      },
    );

    this.nftController = new NftController(
      {
        onPreferencesStateChange:
          this.preferencesController.store.subscribe.bind(
            this.preferencesController.store,
          ),
        getERC721AssetName:
          this.assetsContractController.getERC721AssetName.bind(
            this.assetsContractController,
          ),
        getERC721AssetSymbol:
          this.assetsContractController.getERC721AssetSymbol.bind(
            this.assetsContractController,
          ),
        getERC721TokenURI: this.assetsContractController.getERC721TokenURI.bind(
          this.assetsContractController,
        ),
        getERC721OwnerOf: this.assetsContractController.getERC721OwnerOf.bind(
          this.assetsContractController,
        ),
        getERC1155BalanceOf:
          this.assetsContractController.getERC1155BalanceOf.bind(
            this.assetsContractController,
          ),
        getERC1155TokenURI:
          this.assetsContractController.getERC1155TokenURI.bind(
            this.assetsContractController,
          ),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onNftAdded: ({ address, symbol, tokenId, standard, source }) => {},
        // this.metaMetricsController.trackEvent({
        //   event: EVENT_NAMES.NFT_ADDED,
        //   category: EVENT.CATEGORIES.WALLET,
        //   properties: {
        //     token_contract_address: address,
        //     token_symbol: symbol,
        //     asset_type: AssetType.NFT,
        //     token_standard: standard,
        //     source,
        //   },
        //   sensitiveProperties: {
        //     tokenId,
        //   },
        // }),
      },
      {},
      // initState.NftController,
    );

    this.nftController.setApiKey(process.env.OPENSEA_KEY);

    this.nftDetectionController = new NftDetectionController({
      onNftsStateChange: (listener) => this.nftController.subscribe(listener),
      onPreferencesStateChange: this.preferencesController.store.subscribe.bind(
        this.preferencesController.store,
      ),
      getOpenSeaApiKey: () => this.nftController.openSeaApiKey,
      // getBalancesInSingleCall:
      //   this.assetsContractController.getBalancesInSingleCall.bind(
      //     this.assetsContractController,
      //   ),
      addNft: this.nftController.addNft.bind(this.nftController),
      getNftState: () => this.nftController.state,
    });

    this.incomingTransactionsController = new IncomingTransactionsController({
      blockTracker: this.#blockTrackerProxy,
      chainId: this.chainId,
      preferencesController: this.preferencesController,
      onboardingController: this.onboardingController,
      chainControllerStore: this.store,
      sharedProvider: this.sharedProvider,
    });

    this.txController = new TxController({
      ethQuery: this.ethQuery,
      eip1559support: this.eip1559support,
      keyringController: this.keyringController,
      preferencesController: this.preferencesController,
      chainId: this.chainId,
    });
  }

  async start() {
    await this.initializeProvider();
    this.initialized = true;
    this.incomingTransactionsController.start();
  }

  async stop() {
    this.#autoManagedNetworkClient = null;
    this.incomingTransactionsController.stop();
  }

  async initializeProvider() {
    if (!this.rpcUrl) {
      throw new Error('EVM chain should have a valid rpcUrl');
    }

    await this.lookupNetwork();
  }

  /**
   * Uses the information in the provider config object to look up a known and
   * preinitialized network client. Once a network client is found, updates the
   * provider and block tracker proxy to point to those from the network client,
   * then finally creates an EthQuery that points to the provider proxy.
   *
   * @throws If no network client could be found matching the current provider
   * config.
   */
  #applyNetworkSelection() {
    if (!this.#autoManagedNetworkClient) {
      throw new Error(
        'initializeProvider must be called first in order to switch the network',
      );
    }

    const { provider, blockTracker } = this.#autoManagedNetworkClient;

    if (this.#providerProxy) {
      this.#providerProxy.setTarget(provider);
    } else {
      this.#providerProxy = createEventEmitterProxy(provider);
    }

    if (this.#blockTrackerProxy) {
      this.#blockTrackerProxy.setTarget(blockTracker);
    } else {
      this.#blockTrackerProxy = createEventEmitterProxy(blockTracker, {
        eventFilter: 'skipInternal',
      });
    }

    this.ethQuery = new Eth(this.#providerProxy);
  }

  isAddress(address: string): boolean {
    const isAddress =
      !isBurnAddress(address) &&
      isValidHexAddress(address, {
        mixedCaseUseChecksum: true,
      });
    return isAddress;
  }

  getStandard(): string {
    return 'ethereum';
  }

  async getTransactionReceipt({
    hash,
  }: TransactionMeta): Promise<TxReceipt | null> {
    const transactionReceipt = await this.ethQuery.getTransactionReceipt(hash);
    if (transactionReceipt?.blockNumber) {
      const { baseFeePerGas, timestamp: blockTimestamp } =
        await this.ethQuery.getBlockByHash(
          transactionReceipt?.blockHash,
          false,
        );
      return {
        status: transactionReceipt.status,
        transactionIndex: transactionReceipt.transactionIndex,
        blockHash: transactionReceipt.blockHash,
        blockNumber: transactionReceipt.blockNumber,
        feeUsed: transactionReceipt.gasUsed,
        effectiveGasPrice: transactionReceipt.effectiveGasPrice,
        baseFeePerGas,
        blockTimestamp,
      };
    }
    return null;
  }

  broadcast() {
    return null;
  }

  deriveAccount(hdKey: HDKey) {
    if (!hdKey.publicKey) {
      throw new Error('No public key');
    }
    const pubKey = arrToBufArr(hdKey.publicKey);
    const address = publicToAddress(pubKey, true).toString('hex');
    return { address: addHexPrefix(address) };
  }

  async updateAccount() {
    const address = await this.getOrCreateAccountAddress();
    const result = await this.getBalance(address);
    this.updateCurrentAccount('nativeBalance', result);
    this.updateCurrentAccount('info', {});
    return this.getCurrentAccount();
  }

  abi(abi: any, contract: string) {
    const contractWrap = new EthContract(this.ethQuery);
    return contractWrap(abi).at(contract);
  }

  async readSafe(safeParams: any): Promise<AtomicSafe> {
    const id = getAtomicSwapId(safeParams);
    const contract = this.abi(
      ATOMIC_SWAP_ABI,
      BUILT_IN_NETWORKS[this.chainId].atomicSwapContract,
    );
    const safe = await contract.swaps(id);
    if (safe.sender === NULLISH_TOKEN_ADDRESS) {
      return { data: null, id };
    }
    return { data: safe, id };
  }

  generateClaimSafeParams({
    safeId,
    hashLock,
  }: {
    safeId: string;
    hashLock: string;
  }) {
    const data = encodeFunctionData({
      abi: ATOMIC_SWAP_ABI,
      functionName: 'claimSwap',
      args: [safeId, hashLock],
    });
    return {
      localId: this.chainId,
      from: this.getCurrentAccount().nativeAddress,
      to: BUILT_IN_NETWORKS[this.chainId].atomicSwapContract,
      data,
    };
  }

  generateRefundSafeParams(safeId: string) {
    const data = encodeFunctionData({
      abi: ATOMIC_SWAP_ABI,
      functionName: 'refundSwap',
      args: [safeId],
    });
    return {
      localId: this.chainId,
      from: this.getCurrentAccount().nativeAddress,
      to: BUILT_IN_NETWORKS[this.chainId].atomicSwapContract,
      data,
    };
  }

  async getBalance(address: string): Promise<string> {
    try {
      const result = await this.ethQuery.getBalance(address);
      return result.toString();
    } catch (err: any) {
      throw new Error('getBalance - Cannot get balance', err.message);
    }
  }

  async getTokenBalance(contract: string, address: string) {
    const result = await this.abi(tokenAbi, contract).balanceOf(address);
    return result.balance.toString();
  }

  // _configureProvider(chainId: ChainId) {
  //   const rpcUrl = CHAIN_ID_TO_RPC_URL_MAP[chainId];
  //   if (!rpcUrl) {
  //     throw new Error(
  //       `EthereumController - _configureProvider - no rpc url specified`,
  //     );
  //   }
  //   this._configureStandardProvider(rpcUrl, chainId);
  // }

  // _configureInfuraProvider(type: string, projectId: string) {
  //   const networkClient = createInfuraClient({
  //     network: type,
  //     projectId,
  //   });
  //   this._setNetworkClient(networkClient);
  // }

  // _configureStandardProvider(rpcUrl: string, chainId: string) {
  //   const networkClient = createJsonRpcClient({ rpcUrl, chainId });
  //   this._setNetworkClient(networkClient);
  // }

  // _setNetworkClient({ networkMiddleware, blockTracker }: any) {
  //   const engine = new JsonRpcEngine();
  //   engine.push(networkMiddleware);
  //   this._setProviderAndBlockTracker({ provider, blockTracker });
  // }

  // _setProviderAndBlockTracker({ provider, blockTracker }: any) {
  //   // set new provider and blockTracker

  //   if (this._providerProxy) {
  //     this._providerProxy.setTarget(provider);
  //   } else {
  //     this._providerProxy = createSwappableProxy(provider);
  //   }
  //   if (this._blockTrackerProxy) {
  //     this._blockTrackerProxy.setTarget(blockTracker);
  //   } else {
  //     this._blockTrackerProxy = createEventEmitterProxy(blockTracker, {
  //       eventFilter: 'skipInternal',
  //     });
  //   }

  //   this.ethQuery = new Eth(this._providerProxy);
  // }

  /**
   * Destroy the network controller, stopping any ongoing polling.
   *
   * In-progress requests will not be aborted.
   */
  async destroy() {
    this.#autoManagedNetworkClient?.destroy();
    await this.blockTracker?.destroy();
  }

  // return the proxies so the references will always be good
  getProviderAndBlockTracker() {
    return {
      provider: this.#providerProxy,
      blockTracker: this.#blockTrackerProxy,
    };
  }

  /**
   * Method to check if the block header contains fields that indicate EIP 1559
   * support (baseFeePerGas).
   *
   * @returns true if current network supports EIP 1559
   */
  async getEIP1559Compatibility(): Promise<boolean> {
    const {
      network: { EIPS = {} },
    } = this.store.getState();
    // NOTE: This isn't necessary anymore because the block cache middleware
    // already prevents duplicate requests from taking place
    if (EIPS[1559] !== undefined) {
      return EIPS[1559];
    }
    const latestBlock = await this.#getLatestBlock();
    const supportsEIP1559 = latestBlock?.baseFeePerGas !== undefined;
    this.#setNetworkEIPSupport(1559, supportsEIP1559);
    return supportsEIP1559;
  }

  /**
   * Method to return the latest block for the current network
   *
   */
  #getLatestBlock() {
    return this.ethQuery.getBlockByNumber('latest', false);
  }

  /**
   * Set EIP support indication in the networkDetails store
   *
   * @param EIPNumber
   * @param isSupported
   */
  #setNetworkEIPSupport(EIPNumber: number, isSupported: boolean) {
    this.store.updateState({
      network: {
        ...this.store.getState().network,
        EIPS: {
          [EIPNumber]: isSupported,
        },
      },
    });
  }

  async lookupNetwork() {
    await this.getEIP1559Compatibility();
  }
}
