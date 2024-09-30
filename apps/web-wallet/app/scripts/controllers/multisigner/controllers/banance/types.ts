import { IMultisign, IMultisignTransaction } from '../../types';

export interface IMultisignBinance extends IMultisign {
  transactions?: IMultisignTransaction[];
}
