import { useDispatch, useSelector } from 'react-redux';

import {
  getWalletConnections,
  removeWalletConnection,
  setWalletConnection,
} from '../../ducks/app/app';
import keypairConnection from '../../helpers/utils/connections/keypair';
import { getWalletIcon } from '../../helpers/utils/util';

const WALLETS = [keypairConnection];

export default function useConnection(walletName: string) {
  const instance = WALLETS.find((i) => i.name === walletName);
  const connectedWallets = useSelector(getWalletConnections);
  const dispatch = useDispatch();

  if (!instance) {
    throw new Error('Connection not found');
  }

  return {
    connectionType: instance.type,
    icon: getWalletIcon(instance.name),
    name: instance.name,
    get id() {
      return `${this.name}:${this.connectionType}`;
    },
    get connected() {
      return connectedWallets[this.id];
    },
    async connect() {
      const address = await instance.connect();
      const walletConnection = {
        connectionType: this.connectionType,
        walletName: this.name,
        address,
      };
      dispatch(setWalletConnection(walletConnection));
      return walletConnection;
    },
    async disconnect() {
      await instance.disconnect();
      dispatch(removeWalletConnection(this.connected));
    },
  };
}
