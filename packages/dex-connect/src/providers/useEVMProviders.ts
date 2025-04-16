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
  const { switchChain } = useSwitchChain({ config });
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
              from: from as `0x${string}`,
              to: recipient as `0x${string}`,
            });

            const sendTx = async (): Promise<string> => {
              const result = await sendTransactionAsync({
                connector: item,
                to: recipient as `0x${string}`,
                value: txParams.value,
                data: txParams.data,
              });
              return result;
            };

            return new Promise<string>((resolve, reject) => {
              const handleChainSwitch = async () => {
                try {
                  const result = await sendTx();
                  resolve(result);
                } catch (error) {
                  reject(error);
                }
              };

              switchChain(
                {
                  connector: item,
                  chainId: asset.chainId,
                },
                {
                  onSuccess: handleChainSwitch,
                  onError: handleChainSwitch,
                },
              );
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
