import { AssetModel } from 'dex-helpers/types';
import { useDispatch, useSelector } from 'react-redux';
import { useConnectors, useSendTransaction, useSignMessage, useSwitchChain } from 'wagmi';

import { generateTxParams } from '../../../app/helpers/transactions';
import {
  getWalletConnections,
  removeWalletConnection,
  setWalletConnection,
} from '../../ducks/app/app';
import { WalletConnectionType } from '../../helpers/constants/wallets';
import { getWalletIcon } from '../../helpers/utils/util';
import { signMessage } from 'tronweb/utils';

export default function useEVMConnections() {
  const connectors = useConnectors();
  const dispatch = useDispatch();
  const connectedWallets = useSelector(getWalletConnections);
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();

  const getIdWallet = (name: string) => {
    return `${name}:${WalletConnectionType.eip6963}`;
  };

  return connectors.map(function (item) {
    return {
      connectionType: WalletConnectionType.eip6963,
      icon: item.icon || getWalletIcon(item.name),
      name: item.name,
      id: getIdWallet(item.name),
      get connected() {
        return connectedWallets[getIdWallet(item.name)];
      },
      async getCurrentAddress() {
        const [address] = await item.getAccounts();
        return address;
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
        const isLocalConnected = connectedWallets[getIdWallet(item.name)];
        const isConnected = (await item.isAuthorized()) && isLocalConnected;
        if (isConnected) {
          await item.disconnect();
        }
        if (isLocalConnected) {
          dispatch(
            removeWalletConnection(connectedWallets[getIdWallet(item.name)]),
          );
        }
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
          } catch (e) {
            // do nothing
          }
          try {
            const hash = await sendTransactionAsync({
              connector: item,
              chainId: asset.chainId,
              ...txParams,
            });
            return txSentHandlers?.onSuccess
              ? txSentHandlers.onSuccess(hash)
              : hash;
          } catch (e) {
            if (txSentHandlers?.onError) {
              return txSentHandlers.onError(e);
            }
            throw e;
          }
        };

        return approveTx();
      },
      signMessage(message: string) {
        return signMessageAsync({ connector: item, message });
      },
    };
  });
}
