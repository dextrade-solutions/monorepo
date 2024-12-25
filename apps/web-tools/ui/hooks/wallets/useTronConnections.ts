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

import useConnection from './useConnection';
import { WC_PARAMS } from '../../../app/helpers/web3-client-configuration';
import TronProvider from '../../helpers/utils/connections/tronprovider';

export default function useTronConnections() {
  // const walletConnet = useConnection(
  //   new TronProvider(
  //     new WalletConnectAdapter({
  //       network: 'Mainnet',
  //       options: {
  //         projectId: WC_PARAMS.projectId,
  //         relayUrl: 'wss://relay.walletconnect.com',
  //         metadata: {
  //           name: 'Example App',
  //           description: 'Example App',
  //           url: 'https://yourdapp-url.com',
  //           icons: ['https://yourdapp-url.com/icon.png'],
  //         },
  //       },
  //       web3ModalConfig: {
  //         ...WC_PARAMS.qrModalOptions,
  //         explorerRecommendedWalletIds: [
  //           '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f',
  //           '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
  //           '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
  //         ],
  //       },
  //     }),
  //   ),
  // );
  const ledger = useConnection(new TronProvider(new LedgerAdapter()));
  const tronlink = useConnection(new TronProvider(new TronLinkAdapter()));
  const okx = useConnection(new TronProvider(new OkxWalletAdapter()));
  const bybit = useConnection(new TronProvider(new BybitWalletAdapter()));
  const tokenpocket = useConnection(new TronProvider(new TokenPocketAdapter()));
  const bitkeep = useConnection(new TronProvider(new BitKeepAdapter()));
  const gatewallet = useConnection(new TronProvider(new GateWalletAdapter()));
  const imtoken = useConnection(new TronProvider(new ImTokenAdapter()));
  const foxwallet = useConnection(new TronProvider(new FoxWalletAdapter()));
  return [
    // walletConnet,
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
