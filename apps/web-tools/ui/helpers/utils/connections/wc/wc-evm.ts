import { WalletConnectionType } from 'dex-helpers';

import WcProvider from './wc';

const wcEip155 = new WcProvider({
  type: WalletConnectionType.wcEip155,
  chains: ['eip155:1', 'eip155:10'],
  requiredNamespaces: {
    eip155: {
      methods: [
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
      ],
      chains: ['eip155:1', 'eip155:10'],
      events: ['chainChanged', 'accountsChanged'],
    },
  },
});

export default wcEip155;
