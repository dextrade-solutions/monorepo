import {
  TronLinkAdapter,
  WalletConnectAdapter,
  LedgerAdapter,
  OkxWalletAdapter,
  BybitWalletAdapter,
  TokenPocketAdapter,
  BitKeepAdapter,
  GateWalletAdapter,
  ImTokenAdapter,
  FoxWalletAdapter,
} from '@tronweb3/tronwallet-adapters';

import { WC_PARAMS } from '../constants';
import TronProvider from './tronprovider';

export function useTronProviders() {
  const walletConnet = new TronProvider(
    new WalletConnectAdapter({
      network: 'Mainnet',
      options: {
        projectId: WC_PARAMS.projectId,
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'Example App',
          description: 'Example App',
          url: 'https://yourdapp-url.com',
          icons: ['https://yourdapp-url.com/icon.png'],
        },
      },
      web3ModalConfig: {
        ...WC_PARAMS.qrModalOptions,
        explorerRecommendedWalletIds: [
          '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f',
          '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
          '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
        ],
      },
    }),
  );
  const ledger = new TronProvider(new LedgerAdapter());
  const tronlink = new TronProvider(new TronLinkAdapter());
  const okx = new TronProvider(new OkxWalletAdapter());
  const bybit = new TronProvider(new BybitWalletAdapter());
  const tokenpocket = new TronProvider(new TokenPocketAdapter());
  const bitkeep = new TronProvider(new BitKeepAdapter());
  const gatewallet = new TronProvider(new GateWalletAdapter());
  const imtoken = new TronProvider(new ImTokenAdapter());
  const foxwallet = new TronProvider(new FoxWalletAdapter());
  return [
    walletConnet,
    ledger,
    tronlink,
    okx,
    tokenpocket,
    bitkeep,
    gatewallet,
    imtoken,
    foxwallet,
    bybit,
  ];
}
