import { EventEmitter } from 'events';
import { v1 as random } from 'uuid';
import { Mutex } from 'async-mutex';
import { Contract } from '@ethersproject/contracts';

import {
  BaseControllerV1,
  BaseConfig,
  BaseState,
} from '@metamask/base-controller';
import type { PreferencesState } from '@metamask/preferences-controller';

import { toChecksumHexAddress } from '@metamask/controller-utils';
import { uniqBy } from 'lodash';
import ChainsController from '../../scripts/controllers/chains-controller';
import { Asset } from '../../../shared/lib/asset-model';
import { validateTokenToWatch } from './assetsUtil';

/**
 * @type TokensConfig
 *
 * Tokens controller configuration
 * @property networkType - Network ID as per net_version
 * @property selectedAddress - Vault selected address
 */
export interface TokensConfig extends BaseConfig {
  selectedAddress: string;
}

/**
 * @type AssetSuggestionResult
 * @property result - Promise resolving to a new suggested asset address
 * @property suggestedAssetMeta - Meta information about this new suggested asset
 */
interface AssetSuggestionResult {
  result: Promise<string>;
  suggestedAssetMeta: SuggestedAssetMeta;
}

enum SuggestedAssetStatus {
  accepted = 'accepted',
  failed = 'failed',
  pending = 'pending',
  rejected = 'rejected',
}

export type SuggestedAsset = {
  name?: string;
  address: string;
  symbol: string;
  decimals: number;
  image?: string;
};

export type SuggestedAssetMetaBase = {
  id: string;
  time: number;
  type: string;
  asset: Asset;
};

/**
 * @type SuggestedAssetMeta
 *
 * Suggested asset by EIP747 meta data
 * @property error - Synthesized error information for failed asset suggestions
 * @property id - Generated UUID associated with this suggested asset
 * @property status - String status of this this suggested asset
 * @property time - Timestamp associated with this this suggested asset
 * @property type - Type type this suggested asset
 * @property asset - Asset suggested object
 */
export type SuggestedAssetMeta =
  | (SuggestedAssetMetaBase & {
      status: SuggestedAssetStatus.failed;
      error: Error;
    })
  | (SuggestedAssetMetaBase & {
      status:
        | SuggestedAssetStatus.accepted
        | SuggestedAssetStatus.rejected
        | SuggestedAssetStatus.pending;
    });

/**
 * @type TokensState
 *
 * Assets controller state
 * @property tokens - List of tokens associated with  address pair
 * @property ignoredTokens - List of ignoredTokens associated with  address pair
 * @property detectedTokens - List of detected tokens associated with  address pair
 * @property allTokens - Object containing tokens by account
 * @property allIgnoredTokens - Object containing hidden/ignored tokens by account
 * @property allDetectedTokens - Object containing tokens detected with non-zero balances
 * @property suggestedAssets - List of pending suggested assets to be added or canceled
 */
export interface TokensState extends BaseState {
  tokens: Asset[];
  detectedTokens: Asset[];
  ignoredTokens: string[];
  allTokens: { [key: string]: Asset[] };
  allIgnoredTokens: { [key: string]: string[] };
  allDetectedTokens: { [key: string]: Asset[] };
  suggestedAssets: SuggestedAssetMeta[];
}

/**
 * Controller that stores assets and exposes convenience methods
 */
export class TokensController extends BaseControllerV1<
  TokensConfig,
  TokensState
> {
  private mutex = new Mutex();

  private chainsController: ChainsController;

  private failSuggestedAsset(
    suggestedAssetMeta: SuggestedAssetMeta,
    error: unknown,
  ) {
    const failedSuggestedAssetMeta = {
      ...suggestedAssetMeta,
      status: SuggestedAssetStatus.failed,
      error,
    };
    this.hub.emit(
      `${suggestedAssetMeta.id}:finished`,
      failedSuggestedAssetMeta,
    );
  }

  /**
   * EventEmitter instance used to listen to specific EIP747 events
   */
  hub = new EventEmitter();

  /**
   * Name of this controller used during composition
   */
  override name = 'TokensController';

  /**
   * Creates a TokensController instance.
   *
   * @param options - The controller options.
   * @param options.onPreferencesStateChange - Allows subscribing to preference controller state changes.
   * @param options.config - Initial options used to configure this controller.
   * @param options.state - Initial state to set on this controller.
   * @param options.chainsController
   */
  constructor({
    chainsController,
    onPreferencesStateChange,
    config,
    state,
  }: {
    chainsController: ChainsController;
    onPreferencesStateChange: (
      listener: (preferencesState: PreferencesState) => void,
    ) => void;
    config?: Partial<TokensConfig>;
    state?: Partial<TokensState>;
  }) {
    super(config, state);

    this.chainsController = chainsController;

    this.defaultConfig = {
      selectedAddress: '',
      ...config,
    };

    this.defaultState = {
      tokens: [],
      ignoredTokens: [],
      detectedTokens: [],
      allTokens: {},
      allIgnoredTokens: {},
      allDetectedTokens: {},
      suggestedAssets: [],
      ...state,
    };

    this.initialize();
    this.abortController = new AbortController();

    onPreferencesStateChange(({ selectedAddress }) => {
      const { allTokens, allIgnoredTokens, allDetectedTokens } = this.state;
      this.configure({ selectedAddress });
      const newTokens = allTokens[selectedAddress] || [];

      this.update({
        tokens: newTokens,
        ignoredTokens: allIgnoredTokens[selectedAddress] || [],
        detectedTokens: allDetectedTokens[selectedAddress] || [],
      });
      this.hub.emit('assets:new', newTokens);
    });
  }

  async initTokens(entries: Asset[]): Promise<void> {
    const releaseLock = await this.mutex.acquire();
    const all = uniqBy([...this.state.tokens, ...entries], 'localId').filter(
      ({ localId }) => !this.state.ignoredTokens.includes(localId),
    );
    try {
      const newTokens = await Promise.all(
        all.map((entry) => this.newEntry(entry)),
      );
      const { newAllTokens, newAllIgnoredTokens, newAllDetectedTokens } =
        this._getNewAllTokensState({
          newTokens,
        });
      this.update({
        tokens: newTokens,
        allTokens: newAllTokens,
        allIgnoredTokens: newAllIgnoredTokens,
        allDetectedTokens: newAllDetectedTokens,
      });
      this.hub.emit('assets:new', newTokens);
    } finally {
      releaseLock();
    }
  }

  async newEntry(entry: Asset): Promise<Asset> {
    const [chainId] = entry.localId.split(':');
    const chainController =
      this.chainsController.getControllerByChainId(chainId);

    // let tokenMetadata;
    // let isERC721;
    // if (provider.contract && 'fetchTokenMetadata' in cp.chain) {
    //   [isERC721, tokenMetadata] = await Promise.all([
    //     cp.chain.detectIsERC721(),
    //     cp.chain.fetchTokenMetadata(),
    //   ]);
    // }
    const account = await chainController.getOrCreateAccountAddress();

    return {
      ...entry,
      account,
      // isERC721,
      // aggregators: formatAggregatorNames(tokenMetadata?.aggregators || []),
    };
  }

  /**
   * Adds a token to the stored token list.
   *
   * @param entry - token data entry
   * @returns Current token list.
   */
  async addToken(entry: Asset): Promise<Asset[]> {
    const releaseLock = await this.mutex.acquire();
    try {
      const { tokens, detectedTokens, ignoredTokens } = this.state;
      const newTokens: Asset[] = [...tokens];
      const newEntry = await this.newEntry(entry);
      const previousEntry = newTokens.find((t) => t.localId === entry.localId);
      if (previousEntry) {
        const previousIndex = newTokens.indexOf(previousEntry);
        newTokens[previousIndex] = newEntry;
      } else {
        newTokens.push(newEntry);
      }
      const newDetectedTokens = detectedTokens.filter(
        (t) => t.localId === entry.localId,
      );
      const newIgnoredTokens = ignoredTokens.filter(
        (ingoredLocalId) => ingoredLocalId !== entry.localId,
      );

      const { newAllTokens, newAllIgnoredTokens, newAllDetectedTokens } =
        this._getNewAllTokensState({
          newTokens,
          newIgnoredTokens,
          newDetectedTokens,
        });

      this.update({
        tokens: newTokens,
        ignoredTokens: newIgnoredTokens,
        detectedTokens: newDetectedTokens,
        allTokens: newAllTokens,
        allIgnoredTokens: newAllIgnoredTokens,
        allDetectedTokens: newAllDetectedTokens,
      });
      this.hub.emit('assets:new', newTokens);
      return newTokens;
    } finally {
      releaseLock();
    }
  }

  ignoreTokens(tokensToIgnore: string[]) {
    const { detectedTokens, tokens } = this.state;

    const ignorefilter = (token: Asset) =>
      !tokensToIgnore.some((localId) => localId === token.localId);
    const newDetectedTokens = detectedTokens.filter(ignorefilter);
    const newTokens = tokens.filter(ignorefilter);
    const newIgnoredTokens = [...tokensToIgnore, ...this.state.ignoredTokens];

    const { newAllIgnoredTokens, newAllDetectedTokens, newAllTokens } =
      this._getNewAllTokensState({
        newIgnoredTokens,
        newDetectedTokens,
        newTokens,
      });

    this.update({
      tokens: newTokens,
      ignoredTokens: newIgnoredTokens,
      detectedTokens: newDetectedTokens,
      allIgnoredTokens: newAllIgnoredTokens,
      allDetectedTokens: newAllDetectedTokens,
      allTokens: newAllTokens,
    });
    this.hub.emit('assets:new', newTokens);
  }

  /**
   * Adds a batch of detected tokens to the stored token list.
   *
   * @param incomingDetectedTokens - Array of detected tokens to be added or updated.
   * @param detectionDetails - An object containing the chain ID and address of the currently selected network on which the incomingDetectedTokens were detected.
   * @param detectionDetails.selectedAddress - the account address on which the incomingDetectedTokens were detected.
   * @param detectionDetails.chainId - the chainId on which the incomingDetectedTokens were detected.
   */
  async addDetectedTokens(
    incomingDetectedTokens: Asset[],
    detectionDetails?: { selectedAddress: string; chainId: string },
  ) {
    const releaseLock = await this.mutex.acquire();
    const { tokens, detectedTokens, ignoredTokens } = this.state;
    const newTokens: Asset[] = [...tokens];
    let newDetectedTokens: Asset[] = [...detectedTokens];

    try {
      incomingDetectedTokens.forEach((tokenToAdd) => {
        const { address, symbol, decimals, image, aggregators, isERC721 } =
          tokenToAdd;
        const checksumAddress = toChecksumHexAddress(address);
        const newEntry: Asset = {
          address: checksumAddress,
          symbol,
          decimals,
          image,
          isERC721,
          aggregators,
        };
        const previousImportedEntry = newTokens.find(
          (token) =>
            token.address.toLowerCase() === checksumAddress.toLowerCase(),
        );
        if (previousImportedEntry) {
          // Update existing data of imported token
          const previousImportedIndex = newTokens.indexOf(
            previousImportedEntry,
          );
          newTokens[previousImportedIndex] = newEntry;
        } else {
          const ignoredTokenIndex = ignoredTokens.indexOf(address);
          if (ignoredTokenIndex === -1) {
            // Add detected token
            const previousDetectedEntry = newDetectedTokens.find(
              (token) =>
                token.address.toLowerCase() === checksumAddress.toLowerCase(),
            );
            if (previousDetectedEntry) {
              const previousDetectedIndex = newDetectedTokens.indexOf(
                previousDetectedEntry,
              );
              newDetectedTokens[previousDetectedIndex] = newEntry;
            } else {
              newDetectedTokens.push(newEntry);
            }
          }
        }
      });

      const { selectedAddress: detectionAddress, chainId: detectionChainId } =
        detectionDetails || {};

      const { newAllTokens, newAllDetectedTokens } = this._getNewAllTokensState(
        {
          newTokens,
          newDetectedTokens,
          detectionAddress,
          detectionChainId,
        },
      );

      const { chainId, selectedAddress } = this.config;
      // if the newly added detectedTokens were detected on (and therefore added to) a different chainId/selectedAddress than the currently configured combo
      // the newDetectedTokens (which should contain the detectedTokens on the current chainId/address combo) needs to be repointed to the current chainId/address pair
      // if the detectedTokens were detected on the current chainId/address then this won't change anything.
      newDetectedTokens =
        newAllDetectedTokens?.[chainId]?.[selectedAddress] || [];

      this.update({
        tokens: newTokens,
        allTokens: newAllTokens,
        detectedTokens: newDetectedTokens,
        allDetectedTokens: newAllDetectedTokens,
      });
    } finally {
      releaseLock();
    }
  }

  /**
   * Adds isERC721 field to token object. This is called when a user attempts to add tokens that
   * were previously added which do not yet had isERC721 field.
   *
   * @param tokenAddress - The contract address of the token requiring the isERC721 field added.
   * @returns The new token object with the added isERC721 field.
   */
  async updateTokenType(tokenAddress: string) {
    const isERC721 = await this._detectIsERC721(tokenAddress);
    const { tokens } = this.state;
    const tokenIndex = tokens.findIndex((token) => {
      return token.address.toLowerCase() === tokenAddress.toLowerCase();
    });
    tokens[tokenIndex].isERC721 = isERC721;
    this.update({ tokens });
    return tokens[tokenIndex];
  }

  _createEthersContract(
    tokenAddress: string,
    abi: string,
    ethersProvider: any,
  ): Contract {
    const tokenContract = new Contract(tokenAddress, abi, ethersProvider);
    return tokenContract;
  }

  _generateRandomId(): string {
    return random();
  }

  /**
   * Adds a new suggestedAsset to state. Parameters will be validated according to
   * asset type being watched. A `<suggestedAssetMeta.id>:pending` hub event will be emitted once added.
   *
   * @param asset - The asset to be watched. For now only ERC20 tokens are accepted.
   * @param type - The asset type.
   * @returns Object containing a Promise resolving to the suggestedAsset address if accepted.
   */
  async watchAsset(
    asset: SuggestedAsset,
    type: string,
  ): Promise<AssetSuggestionResult> {
    const defaultController = this.chainsController.getDefaultController();
    if (!defaultController) {
      throw new Error('watchAsset - no default controller found');
    }
    const suggestedAssetMeta = {
      asset: {
        localId: `${defaultController.chainId}:${asset.address}`,
        decimals: asset.decimals,
        symbol: asset.symbol,
        name: asset.name,
        uid: asset.image,
        network: defaultController.sharedProvider.config.network,
        standard: defaultController.sharedProvider.getStandard(asset.address),
      },
      id: this._generateRandomId(),
      status: SuggestedAssetStatus.pending as SuggestedAssetStatus.pending,
      time: Date.now(),
      type,
    };
    try {
      switch (type) {
        case 'ERC20':
          validateTokenToWatch(asset);
          break;
        default:
          throw new Error(`Asset of type ${type} not supported`);
      }
    } catch (error) {
      this.failSuggestedAsset(suggestedAssetMeta, error);
      return Promise.reject(error);
    }

    const result: Promise<string> = new Promise((resolve, reject) => {
      this.hub.once(
        `${suggestedAssetMeta.id}:finished`,
        (meta: SuggestedAssetMeta) => {
          switch (meta.status) {
            case SuggestedAssetStatus.accepted:
              return resolve(meta.asset.localId);
            case SuggestedAssetStatus.rejected:
              return reject(new Error('User rejected to watch the asset.'));
            case SuggestedAssetStatus.failed:
              return reject(new Error(meta.error.message));
            /* istanbul ignore next */
            default:
              return reject(new Error(`Unknown status: ${meta.status}`));
          }
        },
      );
    });

    const { suggestedAssets } = this.state;
    suggestedAssets.push(suggestedAssetMeta);
    this.update({ suggestedAssets: [...suggestedAssets] });
    this.hub.emit('pendingSuggestedAsset', suggestedAssetMeta);
    return { result, suggestedAssetMeta };
  }

  /**
   * Accepts to watch an asset and updates it's status and deletes the suggestedAsset from state,
   * adding the asset to corresponding asset state. In this case ERC20 tokens.
   * A `<suggestedAssetMeta.id>:finished` hub event is fired after accepted or failure.
   *
   * @param suggestedAssetID - The ID of the suggestedAsset to accept.
   */
  async acceptWatchAsset(suggestedAssetID: string): Promise<void> {
    const { suggestedAssets } = this.state;
    const index = suggestedAssets.findIndex(
      ({ id }) => suggestedAssetID === id,
    );
    const suggestedAssetMeta = suggestedAssets[index];
    try {
      switch (suggestedAssetMeta.type) {
        case 'ERC20':
          await this.addToken(suggestedAssetMeta.asset);
          suggestedAssetMeta.status = SuggestedAssetStatus.accepted;
          this.hub.emit(
            `${suggestedAssetMeta.id}:finished`,
            suggestedAssetMeta,
          );
          break;
        default:
          throw new Error(
            `Asset of type ${suggestedAssetMeta.type} not supported`,
          );
      }
    } catch (error) {
      this.failSuggestedAsset(suggestedAssetMeta, error);
    }
    const newSuggestedAssets = suggestedAssets.filter(
      ({ id }) => id !== suggestedAssetID,
    );
    this.update({ suggestedAssets: [...newSuggestedAssets] });
  }

  /**
   * Rejects a watchAsset request based on its ID by setting its status to "rejected"
   * and emitting a `<suggestedAssetMeta.id>:finished` hub event.
   *
   * @param suggestedAssetID - The ID of the suggestedAsset to accept.
   */
  rejectWatchAsset(suggestedAssetID: string) {
    const { suggestedAssets } = this.state;
    const index = suggestedAssets.findIndex(
      ({ id }) => suggestedAssetID === id,
    );
    const suggestedAssetMeta = suggestedAssets[index];
    if (!suggestedAssetMeta) {
      return;
    }
    suggestedAssetMeta.status = SuggestedAssetStatus.rejected;
    this.hub.emit(`${suggestedAssetMeta.id}:finished`, suggestedAssetMeta);
    const newSuggestedAssets = suggestedAssets.filter(
      ({ id }) => id !== suggestedAssetID,
    );
    this.update({ suggestedAssets: [...newSuggestedAssets] });
  }

  /**
   * Takes a new tokens and ignoredTokens array for account
   * and returns new allTokens and allIgnoredTokens state to update to.
   *
   * @param params - Object that holds token params.
   * @param params.newTokens - The new tokens to set for selected account.
   * @param params.newIgnoredTokens - The new ignored tokens to set for selected account.
   * @param params.newDetectedTokens - The new detected tokens to set for selected account.
   * @param params.detectionAddress - The address on which the detected tokens to add were detected.
   * @returns The updated `allTokens` and `allIgnoredTokens` state.
   */
  _getNewAllTokensState(params: {
    newTokens?: Asset[];
    newDetectedTokens?: Asset[];
    newIgnoredTokens?: string[];
    detectionAddress?: string;
  }) {
    const { newTokens, newIgnoredTokens, newDetectedTokens, detectionAddress } =
      params;
    const { allTokens, allIgnoredTokens, allDetectedTokens } = this.state;
    const { selectedAddress } = this.config;

    // wallet address
    const userAddressToAddTokens = detectionAddress ?? selectedAddress;

    let newAllTokens = allTokens;
    if (
      newTokens?.length ||
      (newTokens && allTokens && allTokens[userAddressToAddTokens])
    ) {
      newAllTokens = {
        ...allTokens,
        ...{ [userAddressToAddTokens]: newTokens },
      };
    }

    let newAllIgnoredTokens = allIgnoredTokens;
    if (
      newIgnoredTokens?.length ||
      (newIgnoredTokens &&
        allIgnoredTokens &&
        allIgnoredTokens[userAddressToAddTokens])
    ) {
      newAllIgnoredTokens = {
        ...allIgnoredTokens,
        ...{ [userAddressToAddTokens]: newIgnoredTokens },
      };
    }

    let newAllDetectedTokens = allDetectedTokens;
    if (
      newDetectedTokens?.length ||
      (newDetectedTokens &&
        allDetectedTokens &&
        allDetectedTokens[userAddressToAddTokens])
    ) {
      newAllDetectedTokens = {
        ...allDetectedTokens,
        ...{ [userAddressToAddTokens]: newDetectedTokens },
      };
    }
    return { newAllTokens, newAllIgnoredTokens, newAllDetectedTokens };
  }

  /**
   * Removes all tokens from the ignored list.
   */
  clearIgnoredTokens() {
    this.update({ ignoredTokens: [], allIgnoredTokens: {} });
  }
}

export default TokensController;
