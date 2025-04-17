import { generateTxParams } from 'dex-helpers';
import { parseUnits } from 'viem';
import {
  useConnectors,
  useSendTransaction,
  useSignMessage,
  useSwitchChain,
} from 'wagmi';

import { WalletConnectionType } from '../constants';
import { getWalletIcon } from '../utils';
import { ConnectionProvider } from './interface';

export function useEVMProviders({ config }: { config: any }) {
  const connectors = useConnectors({ config });
  const { sendTransactionAsync } = useSendTransaction({ config });
  const { switchChainAsync } = useSwitchChain({ config });
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
            await switchChainAsync({
              connector: item,
              chainId: asset.chainId,
            });
            await new Promise((resolve) => setTimeout(resolve, 2000));
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
