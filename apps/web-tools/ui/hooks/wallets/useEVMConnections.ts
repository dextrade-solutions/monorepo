import { getAssetKey } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { useDispatch, useSelector } from 'react-redux';
import { parseUnits } from 'viem';
import { useConnectors, useSendTransaction, useSwitchChain } from 'wagmi';

import { generateTxParams } from '../../../app/helpers/transactions';
import {
  getAssetAccounts,
  getWalletConnections,
  removeWalletConnection,
  setWalletConnection,
} from '../../ducks/app/app';
import { WalletConnectionType } from '../../helpers/constants/wallets';
import { getWalletIcon } from '../../helpers/utils/util';

export default function useEVMConnections() {
  const connectors = useConnectors();
  const dispatch = useDispatch();
  const connectedWallets = useSelector(getWalletConnections);
  const assetAccounts = useSelector(getAssetAccounts);
  const { sendTransaction } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();

  return connectors.map((item) => ({
    connectionType: WalletConnectionType.eip6963,
    icon: item.icon || getWalletIcon(item.name),
    name: item.name,
    get id() {
      return `${this.name}:${this.connectionType}`;
    },
    get connected() {
      return connectedWallets[this.id];
    },
    async connect() {
      const result = await item.connect();
      const [address] = result.accounts;
      const walletConnection = {
        connectionType: WalletConnectionType.eip6963,
        address,
        walletName: item.name,
      };
      dispatch(setWalletConnection(walletConnection));
      return walletConnection;
    },
    async disconnect() {
      const isConnected = await item.isAuthorized();
      if (isConnected) {
        await item.disconnect();
      }
      dispatch(removeWalletConnection(this.connected));
    },
    async txSend({
      asset,
      amount,
      recipient,
      txSentHandlers,
    }: {
      asset: AssetModel;
      recipient: string;
      amount: number;
      txSentHandlers: {
        onSuccess: (txHash: string) => void;
        onError: (e: unknown) => void;
      };
    }) {
      const isConnected = await item.isAuthorized();

      if (!isConnected) {
        await item.connect();
      }

      const approveTx = async () => {
        if (!asset.chainId) {
          throw new Error('Asset chainid not found');
        }
        const txParams = generateTxParams({
          asset,
          amount,
          to: recipient,
        });
        try {
          await switchChainAsync({ connector: item, chainId: asset.chainId });
        } catch {
          // do nothing
        }
        return sendTransaction(
          { connector: item, chainId: asset.chainId, ...txParams },
          txSentHandlers,
        );
      };

      return approveTx();
    },
  }));
}
