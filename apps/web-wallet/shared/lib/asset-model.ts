import BigNumber from 'bignumber.js';
import { keyBy } from 'lodash';
import { MetaMaskState } from '../../app/scripts/background';
import { SUPPORTED_FIAT_LIST } from '../../ui/helpers/constants/fiat';
import { formatCurrency } from '../../ui/helpers/utils/confirm-tx.util';
import { NetworkNames, NetworkTypes } from '../constants/exchanger';
import { getCoinIconByUid } from '../constants/tokens';
import { AssetType } from '../constants/transaction';
import { getSharedProvider } from '../shared-chain-provider';
import {
  CHAIN_IDS,
  CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP,
  CHAIN_ID_TO_NETWORK_MAP,
} from '../constants/network';
import { calcTokenAmount } from './transactions-controller-utils';
import { formatLongAmount } from './ui-utils';

export type CoinModel = {
  id?: number;
  networkId?: number;
  ticker: string;
  tokenName?: string;
  uuid: string;
  networkName: string;
  networkType: string;
};

export type Asset = {
  account?: string;
  name?: string;
  localId: string;
  symbol: string;
  decimals?: number; // can be undefined if an asset is fiat
  uid?: string; // image identifier
};

export type AssetOptions = {
  reserve?: any; // Reserve field for p2p exchange purposes
  tokenId?: string; // For NFT

  api: any;
  getState: () => MetaMaskState;
};

function dispatchWrap(
  _target: Object,
  _propertyKey: string,
  descriptor: TypedPropertyDescriptor<void | any>,
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const dispatch = args.find((arg) => arg.name === 'dispatch');
    const result = dispatch
      ? dispatch(originalMethod.apply(this, args))
      : originalMethod.apply(this, args);
    return result;
  };

  return descriptor;
}

function isFiat(localId: string) {
  return SUPPORTED_FIAT_LIST.includes(localId.toUpperCase());
}

export abstract class AssetBridge {
  abstract account?: string;

  abstract balance?: string | null;

  abstract balanceFiat?: string;

  abstract balanceError?: string;

  abstract isExistInWallet: boolean;

  abstract addToWallet(localId: string): Promise<void>;

  abstract removeFromWallet(localId: string): Promise<void>;

  abstract getAccount(): string;
}

export class AssetModel implements Asset {
  public readonly localId: string;

  public readonly chainId: string;

  public readonly name?: string;

  public readonly symbol: string;

  public decimals?: number;

  public readonly uid?: string;

  public account?: string;

  public readonly isFiat;

  currencyAggregator?: string;

  price?: number | null; // asset price in USD

  api?: any | null;

  getState: () => MetaMaskState;

  constructor(tokenOrTokenId: Asset | string, options: AssetOptions) {
    let token: Asset;
    if (typeof tokenOrTokenId === 'string') {
      if (isFiat(tokenOrTokenId)) {
        const fiat = tokenOrTokenId.toUpperCase();
        token = {
          localId: fiat,
          name: fiat,
          symbol: fiat,
          uid: fiat.toLowerCase(),
        };
      } else {
        const { tokensRegistry, usedNetworks, tokens } = options.getState();
        const userTokens = keyBy(tokens, 'localId');
        const nativeTokens = Object.values(usedNetworks).reduce(
          (acc, { config }) => ({
            ...acc,
            [config.chainId]: {
              localId: config.chainId,
              name: config.nickname || config.ticker,
              symbol: config.ticker,
              decimals: config.decimals || 18,
              uid: config.network,
            },
          }),
          {},
        );
        const allRegistry = Object.assign(
          nativeTokens,
          tokensRegistry,
          userTokens,
        );
        token = allRegistry ? allRegistry[tokenOrTokenId] : null;
      }
      if (!token) {
        token = {
          localId: tokenOrTokenId,
          name: 'Unknown Token',
          symbol: '',
          uid: 'unknown',
        };
      }
    } else {
      token = tokenOrTokenId;
    }
    this.chainId = token.localId.split(':')[0];
    this.localId = token.localId;
    this.name = token.name;
    this.symbol = token.symbol;
    this.decimals = token.decimals;
    this.uid = token.uid;
    this.account = token.account;
    this.isFiat = isFiat(token.localId);

    this.api = options?.api;
    this.getState = options?.getState;
  }

  get appState() {
    if (!this.getState) {
      throw new Error(`AssetModel - no state available`);
    }
    return this.getState();
  }

  get isExistInWallet() {
    return this.appState.tokens.find((t: Asset) => t.localId === this.localId);
  }

  get reserve() {
    const { exchangerReserves = [] } = this.appState;
    const reserve = exchangerReserves.find(
      ({ walletAddress, coin }) =>
        walletAddress === this.getAccount() &&
        coin.ticker === this.symbol &&
        coin.networkName === this.network,
    );

    return reserve?.reserve;
  }

  get balanceFiat() {
    if (!this.balance) {
      return '0';
    }
    const conversionRate =
      this.appState.rates[this.symbol]?.conversionRate || 0;
    const tokenAmount = calcTokenAmount(this.balance, this.decimals);
    return tokenAmount.mul(conversionRate).toString();
  }

  get balance() {
    if (this.isFiat && this.reserve) {
      return this.reserve;
    }
    try {
      const result = this.getBalanceInstance();
      return String(result?.balance || '');
    } catch {
      return null;
    }
  }

  get isNativeToken() {
    return !this.isFiat && !this.contract;
  }

  get contract() {
    const [, contract] = this.localId.split(':');
    return contract;
  }

  get hasActiveNetwork() {
    return Boolean(this.getState().usedNetworks[this.chainId]);
  }

  get sharedProvider() {
    if (this.hasActiveNetwork) {
      const { config } = this.getState().usedNetworks[this.chainId];
      return getSharedProvider(config);
    }
    return null;
  }

  get type() {
    // TODO: Also it can be multisig
    return this.contract ? AssetType.token : AssetType.native;
  }

  //* * Network alias for p2p */
  get network() {
    if (this.isFiat) {
      return NetworkNames.fiat;
    }
    return CHAIN_ID_TO_NETWORK_MAP[this.chainId] || 'rpc';
  }

  /** Need only for p2p compatibility, it can be standard or just network name */
  get standard() {
    if (this.isFiat) {
      return NetworkTypes.fiat;
    } else if (this.isNativeToken && this.chainId !== CHAIN_IDS.BTC) {
      return null;
    }
    if (this.chainId === CHAIN_IDS.BSC) {
      return 'bep20';
    } else if (this.chainId === CHAIN_IDS.MAINNET) {
      return 'erc20';
    } else if (this.chainId === CHAIN_IDS.TRON) {
      return 'trc20';
    } else if (this.chainId === CHAIN_IDS.BTC) {
      return 'bip44';
    }
    return CHAIN_ID_TO_NETWORK_MAP[this.chainId];
  }

  @dispatchWrap
  addToWallet() {
    return this.api.addToken({ token: this.getToken() });
  }

  @dispatchWrap
  removeFromWallet() {
    return this.api.ignoreTokens({ tokensToIgnore: [this.localId] });
  }

  @dispatchWrap
  startSwap() {
    return this.api.setSwapsFromToken(this.getRenderableTokenData());
  }

  @dispatchWrap
  startNewDraftTransaction() {
    return this.api.startNewDraftTransaction(this);
  }

  getBalanceInstance() {
    const { balances, selectedAddress } = this.appState;
    const account = this.getAccount();
    const currentBalances = balances[selectedAddress] || [];
    const result = currentBalances.find(
      (t) => t.localId === this.localId && t.account === account,
    );
    return result;
  }

  getAccount() {
    if (this.account) {
      return this.account;
    }
    const { usedNetworks, selectedAddress } = this.appState;
    return usedNetworks[this.chainId]?.accounts[selectedAddress]?.nativeAddress;
  }

  getExziWithdrawLink() {
    const EXZI_URL = 'https://dev.exzi.com';
    return `${EXZI_URL}/withdraw/${
      this.symbol
    }?network=${this.network.toUpperCase()}&destination_address=${
      this.account
    }`;
  }

  getRenderableTokenData() {
    const { balance, balanceError } = this.getBalanceInstance() || {};
    const tokenAmount = balance
      ? calcTokenAmount(balance, this.decimals)
      : new BigNumber(0);
    const string = balance ? tokenAmount.round(8).toString() : null;
    const formattedFiat =
      balance && this.balanceFiat
        ? formatCurrency(this.balanceFiat, this.appState.currentCurrency)
        : '';
    const rawFiat = this.balanceFiat || '';

    const usedIconUrl = this.getIconUrl();

    let reservedBalance = null;
    if (this.reserve) {
      reservedBalance =
        tokenAmount.toNumber().toFixed(8) - this.reserve.toFixed(8);
      if (reservedBalance > 0) {
        reservedBalance = formatLongAmount(reservedBalance);
      }
    }

    return {
      localId: this.localId,
      chainId: this.chainId,
      hasActiveNetwork: this.hasActiveNetwork,
      primaryLabel: this.symbol,
      secondaryLabel: this.standard,
      string,
      rightPrimaryLabel:
        string && `${new BigNumber(string).round(6).toString()} ${this.symbol}`,
      rightSecondaryLabel: formattedFiat,
      formattedFiat,
      iconUrl: usedIconUrl,
      identiconAddress: usedIconUrl ? null : this.getAccount(),
      balance: this.balance,
      balanceError,
      decimals: this.decimals,
      reservedBalance,
      symbol: this.symbol,
      name: this.name,
      network: this.network,
      standard: this.standard,
      rawFiat,
    };
  }

  setPriceInUSD(price: number | null) {
    this.price = price;
  }

  setCurrencyAggregator(currencyAggregator: string) {
    this.currencyAggregator = currencyAggregator;
  }

  getIconUrl() {
    let src;
    if (this.uid?.includes('https://')) {
      src = this.uid;
    }
    if (!src && !this.isFiat && !this.contract) {
      src = CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP[this.chainId];
    }

    if (src) {
      return src;
    }

    return getCoinIconByUid(this.uid);
  }

  /**
   * Convert asset to coin for P2P-server
   */
  getCoin(): CoinModel {
    return {
      ticker: this.symbol,
      tokenName: this.name,
      uuid: this.uid || '',
      networkName: this.network,
      networkType: this.standard,
    };
  }

  getToken(): Asset {
    return {
      account: this.getAccount(),
      name: this.name,
      localId: this.localId,
      symbol: this.symbol,
      decimals: this.decimals,
      uid: this.uid,
    };
  }
}
