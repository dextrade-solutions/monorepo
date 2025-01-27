/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
// import { type EthereumProvider } from '@walletconnect/ethereum-provider'
import { getAddress } from 'viem';
import { createConnector, normalizeChainId } from 'wagmi';
import { getTrustWalletProvider } from '../utils';

trustWalletConnect.type = 'trustWalletConnect' as const;
export function trustWalletConnect() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  type Properties = {};
  type StorageItem = {
    store: any;
    'wagmi.recentConnectorId': string;
  };

  type Provider = Awaited<ReturnType<(typeof EthereumProvider)['init']>>;

  let walletProvider: Provider | undefined;

  const handleConnectReset = () => {
    walletProvider = undefined;
  };

  return createConnector<Provider, Properties, StorageItem>((config) => ({
    id: 'trustWalletConnect',
    name: 'TrustWallet',
    type: trustWalletConnect.type,
    async connect({ chainId } = {}) {
      try {
        const provider = await this.getProvider({ chainId });

        config.emitter.emit('message', { type: 'connecting' });

        await provider.request({
          method: 'eth_requestAccounts',
        });

        const accounts = await this.getAccounts();
        const _chainId = await this.getChainId();

        return { accounts, chainId: _chainId };
      } catch (error: unknown) {
        handleConnectReset();
        throw error;
      }
    },
    async disconnect() {
      const provider = await this.getProvider();
      await provider.request({ method: 'wallet_disconnect' });
      handleConnectReset();
    },
    async getAccounts() {
      const provider = await this.getProvider();
      const accounts = (await provider.request({
        method: 'eth_accounts',
      })) as string[];

      return accounts.map((x) => getAddress(x));
    },
    async getChainId() {
      const provider = await this.getProvider();
      const chainId = await provider?.request({ method: 'eth_chainId' });
      return normalizeChainId(chainId);
    },
    async getProvider() {
      if (!walletProvider) {
        walletProvider = getTrustWalletProvider();
        if (!walletProvider) {
          throw new Error('Blocto SDK is not initialized.');
        }

        walletProvider.on('accountsChanged', this.onAccountsChanged.bind(this));
        walletProvider.on('chainChanged', this.onChainChanged.bind(this));
        walletProvider.on('disconnect', this.onDisconnect.bind(this));
      }

      return Promise.resolve(walletProvider);
    },
    async isAuthorized() {
      const recentConnectorId =
        await config.storage?.getItem('recentConnectorId');
      if (recentConnectorId !== this.id) {
        return false;
      }

      const accounts = await this.getAccounts();
      return Boolean(accounts.length);
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onAccountsChanged() {},
    async onChainChanged(chainId: string) {
      const accounts = await this.getAccounts();
      config.emitter.emit('change', {
        chainId: normalizeChainId(chainId),
        accounts,
      });
    },
    async onDisconnect() {
      config.emitter.emit('disconnect');
    },
  }));
}
