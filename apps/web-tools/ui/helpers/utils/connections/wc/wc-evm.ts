import { WalletConnectionType } from 'dex-helpers';

import WcProvider from './wc';
import { generateEvmTxParams } from '../../../../../app/helpers/transactions';

const wcEip155 = new WcProvider({
  type: WalletConnectionType.wcEip155,
  chains: ['eip155:1'],
  requiredNamespaces: {
    eip155: {
      methods: [
        'eth_sendTransaction',
        // 'eth_signTransaction',
        // 'eth_sign',
        'personal_sign',
        // 'eth_signTypedData',
      ],
      chains: ['eip155:1'],
      events: ['chainChanged', 'accountsChanged'],
    },
  },
  async signMsgRequest(client: any, session: any, message: string) {
    const signature = await client.request({
      chainId: 'eip155:1',
      topic: session.topic,
      request: {
        method: 'personal_sign',
        params: [message, '0x1F50f7bD7ACFD50e7011941e325A17bC6AC05dC1'],
      },
    });
    return { signature };
  },
  async txSendRequest(
    client,
    session,
    { contractAddress, sender, recipient, value },
  ) {
    const approveTx = async () => {
      const txParams = generateEvmTxParams({
        contractAddress,
        from: sender,
        to: recipient,
        value,
      });
      debugger;
      await client.request({
        topic: session.topic,
        request: {
          method: 'eth_sendTransaction',
          params: [txParams],
        },
      });
    };

    return approveTx();
  },
});

export default wcEip155;
