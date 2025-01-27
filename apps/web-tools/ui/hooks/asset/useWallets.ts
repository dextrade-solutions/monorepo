import { useConnections, WalletConnectionType } from 'dex-connect';
import { useDispatch } from 'react-redux';
import { useConfig } from 'wagmi';

import { removeWalletConnection } from '../../ducks/app/app';

export function useWallets({
  connectionType,
  includeKeypairWallet,
}: {
  connectionType?: WalletConnectionType[];
  includeKeypairWallet?: boolean;
} = {}) {
  const dispatch = useDispatch();
  const config = useConfig();
  const { connections, hub } = useConnections({
    connectionType,
    wagmiConfig: config,
  });
  hub.on('disconnected', (i) => {
    dispatch(removeWalletConnection(i));
  });
  return connections?.data || [];
}
