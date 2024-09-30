import { ApprovalController } from '@metamask/approval-controller';
import { SubjectMetadataController } from '@metamask/subject-metadata-controller';
import { IKeyValueStorage } from '@walletconnect/keyvaluestorage';
import TransactionController from '../transactions';
import ChainsController from '../chains-controller';
import PreferencesController from '../preferences';
import SignController from '../sign';

export type WalletConnectOptions = {
  preferencesController: PreferencesController;
  transactionController: TransactionController;
  chainsController: ChainsController;
  approvalController: ApprovalController;
  subjectMetadataController: SubjectMetadataController;
  signController: SignController;
};

export interface WalletManagerOptions extends WalletConnectOptions {
  storage: IKeyValueStorage;
}
