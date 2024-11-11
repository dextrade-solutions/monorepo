import { AssetModel } from 'dex-helpers/types';
import { useSelector } from 'react-redux';
import { useConnectors } from 'wagmi';

import { getAssetAccount } from '../../ducks/app/app';

export default function useAsset(asset: AssetModel) {
  const assetAccount = useSelector((state) => getAssetAccount(state, asset));
  const connectors = useConnectors();
  const connector = connectors.find(
    (i) => i.name === assetAccount?.connectedWallet,
  );

  return {
    connector,
  };
}
