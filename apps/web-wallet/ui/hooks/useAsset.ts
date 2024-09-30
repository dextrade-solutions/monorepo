import { useSelector } from 'react-redux';
import { Asset } from '../../shared/lib/asset-model';

import { assetModel } from '../selectors';

export function useAsset(token: Asset | string) {
  try {
    const item = useSelector((state) => assetModel(state, token));
    return item;
  } catch (e) {
    return null;
  }
}
