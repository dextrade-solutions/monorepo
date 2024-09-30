import { HDKey } from 'ethereum-cryptography/hdkey';
import { ObservableStore } from '@metamask/obs-store';
import { TxReceipt } from '../../../../shared/constants/transaction';
import PreferencesController from '../preferences';

import { TransactionMeta } from '../transactions';
import {
  ChainId,
  ControllerState,
  EnqueueWithCooldown,
  NativeAccount,
} from './types';

export default interface ChainController {
  store: ObservableStore<ControllerState>;
  chainId: ChainId;
  isTestnet: boolean;

  preferencesController: PreferencesController;

  enqueueWithCooldown: EnqueueWithCooldown;

  getCurrentAccount(): NativeAccount;
  /**
   * Getting account balance by address string
   */
  getBalance(address: string | null): Promise<string>;

  getTokenBalance?(contract: string, address: string): Promise<string>;

  /**
   * Getting account via Hierarchical Deterministic key
   */
  deriveAccount(hdKey: HDKey): any;

  /**
   * Check string is valid address
   *
   * @param address - input account address
   */
  isAddress(address: string): boolean;

  getStandard(): string | null;

  /**
   * Get receipt by transaction hash,
   * if it returns null - transaction is not confirmed
   *
   * @param txMeta
   */
  getTransactionReceipt(txMeta: TransactionMeta): Promise<TxReceipt | null>;

  start(): Promise<void>;

  stop(): Promise<void>;

  destroy(): void;
}

export interface IncomingTransactionsController {
  start(): void;
  stop(): void;
}
