import { HDKey } from 'ethereum-cryptography/hdkey';
import { RatesDict } from '../../../../overrided-metamask/assets-controllers';
import { ProviderConfig } from '../../chains-controller/types';
import { IMultisignerAddressedState, IMultisignerConfig } from '../types';
import { MultisignerCreatorController } from './MultisignerCreatorController';

export interface IMultisignerControllerConfig extends IMultisignerConfig {
  provider: ProviderConfig;
  update: (state: any) => void;
  getState: () => IMultisignerAddressedState['state'];
  creator: MultisignerCreatorController;
  getWalletMnemonicHash: () => string;
  deriveHdKey: () => Promise<HDKey>;
  getRates: () => RatesDict;
  isTestnet: boolean;
}

export interface IMultisignerControllerProps {
  isTestnet: boolean;
  config: IMultisignerControllerConfig;
}

export interface IMultisignerTransactionWeight {
  id: string;
  amount: number;
  toAddress: string;
}

export interface IMultisignerTransactionCreate
  extends IMultisignerTransactionWeight {
  fee?: number;
}

export interface IMultisignerController {
  start(): Promise<unknown>;
  stop(): Promise<unknown>;
  destroy(): Promise<void>;
  generate(): Promise<string>;
  add(multisigId: string): Promise<void>;
  remove(multisigId: string): Promise<void>;
  transactionWeight(payloads: IMultisignerTransactionWeight): Promise<any>;
  transactionCreate(payloads: IMultisignerTransactionCreate): Promise<any>;
  transactionSign(txId: string): Promise<void>;
  transactionDecline(txId: string): Promise<void>;
}
