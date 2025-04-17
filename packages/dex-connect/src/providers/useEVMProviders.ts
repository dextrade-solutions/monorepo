import { generateTxParams } from 'dex-helpers';
import { parseUnits } from 'viem';
import { useConnectors, useSendTransaction, useSignMessage } from 'wagmi';

import { WalletConnectionType } from '../constants';
import { getWalletIcon } from '../utils';
import { ConnectionProvider } from './interface';

export function useEVMProviders({ config }: { config: any }) {
  const connectors = useConnectors({ config });
  const { sendTransactionAsync } = useSendTransaction({ config });
  const { signMessageAsync } = useSignMessage({ config });
  return connectors
    .filter(
      ({ id }) =>
        !['io.metamask', 'io.metamask.mobile', 'com.trustwallet.app'].includes(
          id,
        ),
    )
    .map(function (item) {
      const connector: ConnectionProvider = {
        type: WalletConnectionType.eip6963,
        icon: item.icon || getWalletIcon(item.name),
        name: item.name,
        isAuthorized() {
          return item.isAuthorized();
        },
        async connect() {
          const result = await item.connect();
          const [address] = result.accounts;
          return address;
        },
        async disconnect() {
          return item.disconnect();
        },
        async txSend(params) {
          const { asset, amount, recipient } = params;
          const isConnected = await item.isAuthorized();

          if (!isConnected) {
            await item.connect();
          }

          const provider = await item.getProvider({ chainId: asset.chainId });
          const currentChainId = await provider.request({
            method: 'eth_chainId',
          });
          const hexChainId = `0x${asset.chainId!.toString(16)}`;
          if (currentChainId !== hexChainId) {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: hexChainId }],
            });
          }

          const approveTx = async () => {
            if (!asset.chainId) {
              throw new Error('Asset chainid not found');
            }
            const value = parseUnits(String(amount), asset.decimals);
            const [from] = await item.getAccounts();
            const txParams = generateTxParams({
              asset,
              value,
              from,
              to: recipient,
            });
            return sendTransactionAsync({
              connector: item,
              chainId: asset.chainId,
              ...txParams,
            });
          };

          return approveTx();
        },
        signMessage(message: string) {
          return signMessageAsync({ connector: item, message });
        },
      };
      return connector;
    });
}
