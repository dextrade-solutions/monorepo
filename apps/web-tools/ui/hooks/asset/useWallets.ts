import { Adapter } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { useEffect, useState } from 'react';
import { Connector } from 'wagmi';

import { config } from '../../../app/helpers/web3-client-configuration';
import { ledgerConnection } from '../../helpers/utils/ledger';
import { AssetAccount } from '../../types';

const getEIP6963SerilizedConnectedAccount = (
  uid: string,
): AssetAccount | null => {
  const connection = config.state.connections.get(uid);
  if (connection) {
    const [address] = connection.accounts;
    return {
      icon: connection.connector.icon,
      connectedWallet: connection.connector.name,
      address,
    };
  }
  return null;
};

const getSolanaSerializedConnectedAccount = (adapter: Adapter) => {
  if (adapter.connected) {
    return {
      icon: adapter.icon,
      connectedWallet: adapter.name,
      address: adapter.publicKey.toBase58(),
    };
  }
  return null;
};

export type WalletItem = {
  icon?: string;
  name: string;
  connected: AssetAccount | null;
  connect: () => Promise<AssetAccount>;
  disconnect: () => Promise<void>;
};

const getConnectorIcon = (item: Connector) => {
  if (item.name === 'WalletConnect') {
    return '/images/icons/wallet-connect.svg';
  }
  return item.icon;
};

// if asset is not passed, shows only EVM wallets
export function useWallets({ asset }: { asset?: AssetModel } = {}) {
  const { wallets, select } = useWallet();

  const [walletsModels, setWalletsModels] = useState<WalletItem[]>([]);

  useEffect(() => {
    const updateWallets = () => {
      let supportedWallets: WalletItem[] = [];

      if (!asset || asset?.chainId) {
        supportedWallets = config.connectors.map((item) => ({
          icon: getConnectorIcon(item),
          name: item.name,
          connected: getEIP6963SerilizedConnectedAccount(item.uid),
          connect: async () => {
            const result = await item.connect();
            const [address] = result.accounts;
            config.state.connections.set(item.uid, {
              ...result,
              connector: item,
            });
            return {
              address,
              connectedWallet: item.name,
              icon: getConnectorIcon(item),
            };
          },
          disconnect: async () => {
            await item.disconnect();
            config.state.connections.delete(item.uid);
            updateWallets();
          },
        }));
      }

      if (asset?.network === NetworkNames.solana) {
        supportedWallets = wallets.map((item) => ({
          icon: item.adapter.icon,
          name: item.adapter.name,
          connected: getSolanaSerializedConnectedAccount(item.adapter),
          connect: async (): Promise<AssetAccount> => {
            select(item.adapter.name);
            await item.adapter.connect();
            const address = item.adapter.publicKey?.toBase58();
            const { icon } = item.adapter;
            if (!address) {
              throw new Error('connect solana wallet - something is wrong');
            }
            return {
              address,
              connectedWallet: item.adapter.name,
              icon,
            };
          },
          disconnect: () => item.adapter.disconnect(),
        }));
      }

      if (asset && !asset.chainId) {
        supportedWallets.push({
          icon: ledgerConnection.icon,
          name: ledgerConnection.name,
          connected: null,
          connect: () => ledgerConnection.connect(asset.network),
          disconnect: () => ledgerConnection.disconnect(),
        });
      }
      setWalletsModels(supportedWallets);
    };

    updateWallets();
  }, [wallets, asset, select]);

  return walletsModels;
}
