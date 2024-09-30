import {
  IMultisignerControllerProps,
  IMultisignerTransactionCreate,
  IMultisignerTransactionWeight,
} from '../IMultisignerController';
import { MultisignerController } from '../MultisignerController';

export class MultisignerETHController extends MultisignerController {
  constructor(props: IMultisignerControllerProps) {
    super(props.config);
  }

  async add(multisignId: string): Promise<void> {
    console.log('MultisignerETHController => add => multisignId', multisignId);
    return Promise.resolve(undefined);
  }

  async generate(): Promise<string> {
    return Promise.resolve('');
  }

  async onStart(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async onStop(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async remove(multisignId: string): Promise<void> {
    console.log(
      'MultisignerETHController => remove => multisignId',
      multisignId,
    );
    return Promise.resolve(undefined);
  }

  async transactionCreate(
    payloads: IMultisignerTransactionCreate,
  ): Promise<any> {
    console.log(
      'MultisignerETHController => transactionCreate => payloads',
      payloads,
    );
    return Promise.resolve(undefined);
  }

  async transactionDecline(txId: string): Promise<void> {
    console.log('MultisignerETHController => transactionDecline=> txId', txId);
    return Promise.resolve(undefined);
  }

  async transactionSign(txId: string): Promise<void> {
    console.log('MultisignerETHController => transactionSign => txId', txId);
    return Promise.resolve(undefined);
  }

  async transactionWeight(
    payloads: IMultisignerTransactionWeight,
  ): Promise<any> {
    console.log(
      'MultisignerETHController => transactionWeight => payloads',
      payloads,
    );
    return Promise.resolve(undefined);
  }
}
