import { WalletConnectionType } from 'dex-helpers';
import WcProvider from './wc';

enum WalletConnectChainID {
  Mainnet = 'tron:0x2b6653dc',
  Shasta = 'tron:0x94a9059e',
  Nile = 'tron:0xcd8690dc',
}
export type ChainID = WalletConnectChainID | `tron:${string}`;
enum WalletConnectMethods {
  signTransaction = 'tron_signTransaction',
  signMessage = 'tron_signMessage',
}

const wcTron = new WcProvider({
  type: WalletConnectionType.wcTron,
  chains: [WalletConnectChainID.Mainnet],
  explorerRecommendedWalletIds: [
    '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f',
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
  ],
  requiredNamespaces: {
    tron: {
      chains: [WalletConnectChainID.Mainnet],
      methods: [
        WalletConnectMethods.signMessage,
        WalletConnectMethods.signTransaction,
      ],
      events: [],
    },
  },
});

export default wcTron;
