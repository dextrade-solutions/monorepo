import { useEffect, useState } from 'react';
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
  const [txHash, setTxHash] = useState<string | null>(null);
  const [pendingTx, setPendingTx] = useState<{
    item: any;
    asset: any;
    txParams: any;
  } | null>(null);

  useEffect(() => {
    if (!pendingTx) {
      return;
    }

    let isMounted = true;
    const { item, txParams } = pendingTx;

    const sendTx = async (): Promise<string> => {
      const result = await sendTransactionAsync({
        connector: item,
        to: txParams.to,
        chainId: txParams.chainId,
        value: txParams.value,
        data: txParams.data,
      });
      setTxHash(result);
    };

    if (isMounted) {
      sendTx();
    }

    return () => {
      isMounted = false;
    };
  }, [pendingTx, switchChain, sendTransactionAsync]);

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
          const value = parseUnits(String(amount), asset.decimals || 18);
          const [from] = await item.getAccounts();
          const txParams = generateTxParams({
            asset,
            value,
            from: from as `0x${string}`,
            to: recipient as `0x${string}`,
          });

          const isConnected = await item.isAuthorized();

          if (!isConnected) {
            await item.connect();
          }

          if (!asset.chainId) {
            throw new Error('Asset chainid not found');
          }

          switchChain(
            {
              connector: item,
              chainId: asset.chainId,
            },
            {
              onSuccess: () => setPendingTx({ item, asset, txParams }),
              onError: () => setPendingTx({ item, asset, txParams }),
            },
          );
          return txHash || '';
        },
        signMessage(message: string) {
          return signMessageAsync({ connector: item, message });
        },
      };
      return connector;
    })
}
