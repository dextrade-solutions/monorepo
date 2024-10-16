import { useWallet } from '@solana/wallet-adapter-react';
import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';

import { config } from '../../../app/helpers/web3-client-configuration';
import { AssetAccount } from '../../types';

export function useWallets({ asset }: { asset: AssetModel }) {
  const { wallets, select } = useWallet();
  if (asset.chainId) {
    const currentConnections = config.state.connections.keys().toArray();

    return config.connectors.map((item) => ({
      icon: item.icon,
      name: item.name,
      connected: currentConnections.includes(item.uid),
      connect: async (): Promise<AssetAccount> => {
        const result = await item.connect();
        const [address] = result.accounts;
        return { address, connectedWallet: item.name, icon: item.icon };
      },
    }));
  }

  if (asset.network === NetworkNames.solana) {
    return wallets.map((item) => ({
      icon: item.adapter.icon,
      name: item.adapter.name,
      connected: item.adapter.connected,
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
    }));
  }
  return [];
}
