import { Asset } from '../../network/chain-provider';
import { defaultCreatorData } from '../constants';
import { IMultisignerAddressedState, IMultisignerCreatorState } from '../types';
import { MultisignerController } from './MultisignerController';

interface MultisignerCreatorControllerProps {
  update: (state: Partial<IMultisignerAddressedState>) => void;
  getState: () => IMultisignerCreatorState;
  getControllers: () => Map<string, MultisignerController>;
  getTokensWithBalances: () => Asset[];
}

export class MultisignerCreatorController {
  private readonly updater: MultisignerCreatorControllerProps['update'];

  private readonly getState: MultisignerCreatorControllerProps['getState'];

  private readonly getControllers: MultisignerCreatorControllerProps['getControllers'];

  private readonly getTokensWithBalances: MultisignerCreatorControllerProps['getTokensWithBalances'];

  constructor({
    update,
    getState,
    getControllers,
    getTokensWithBalances,
  }: MultisignerCreatorControllerProps) {
    this.updater = update;
    this.getState = getState;
    this.getControllers = getControllers;
    this.getTokensWithBalances = getTokensWithBalances;
  }

  private get state(): IMultisignerCreatorState {
    return this.getState();
  }

  private update(state: Partial<IMultisignerCreatorState>) {
    const updatedState = {
      ...this.state,
      ...state,
    };
    this.updater({ creator: updatedState });
  }

  public setToken(localId: string) {
    if (!localId) {
      this.update({
        token: null,
      });
      return;
    }
    const tokens = this.state.tokens || [];
    const token = tokens.find((t) => t.localId === localId) || null;

    if (!token) {
      throw new Error(`Token with localId: ${localId} not found!`);
    }
    this.update({
      token,
      totalSigners: null,
      minForBroadcasting: null,
      provider: token.provider,
    });
  }

  public setTokenScript(values: Record<string, number>) {
    const includesValues = ['totalSigners', 'minForBroadcasting'];
    const updateValue = Object.entries(values).reduce((acc, [k, v]) => {
      if (!includesValues.includes(k)) {
        return acc;
      }
      acc[k] = v;
      return acc;
    }, {} as Partial<IMultisignerCreatorState>);
    this.update(updateValue);
  }

  public get chain(): string {
    const { contract, chainId } = this.state.provider;
    return contract || chainId || '';
  }

  public get tokenLocalId(): string {
    return this.state.token.localId;
  }

  public get totalSigners(): number | null {
    return this.state.totalSigners;
  }

  public get minForBroadcasting(): number | null {
    return this.state.minForBroadcasting;
  }

  public mount() {
    const controllers = this.getControllers();
    const tokens = Array.from(
      this.getTokensWithBalances().reduce((acc, token) => {
        const { localId } = token || {};
        if (!localId || acc.has(localId) || !controllers.has(localId)) {
          return acc;
        }
        return acc.set(localId, token);
      }, new Map()),
      ([_, token]) => token,
    );
    this.update({ tokens });
  }

  public unmount() {
    this.update(defaultCreatorData);
  }
}
