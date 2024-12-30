import { WalletConnectModal } from '@walletconnect/modal';
import WalletConnectClient from '@walletconnect/sign-client';
import { UniversalProvider } from '@walletconnect/universal-provider';
import { address } from 'bitcoinjs-lib';
import { broadcastService } from 'dex-services';

import { ConnectionProvider, TxParams } from './interface';
// import buildTx from '../../../../app/helpers/tron/build-tx';
import { WalletConnectChainID, WalletConnectMethods } from './wc-tron';
import { WC_PARAMS } from '../../../../../app/helpers/web3-client-configuration';
import { WalletConnectionType } from '../../../constants/wallets';

export default class WcProvider implements ConnectionProvider {
  client: WalletConnectClient;

  session: any;

  web3Modal: any;

  type: WalletConnectionType;

  name = 'WalletConnect';

  requiredNamespaces;

  signMsgRequest: any;

  txSendRequest: any;

  chains;

  constructor({
    chains,
    type,
    explorerRecommendedWalletIds,
    requiredNamespaces,
    signMsgRequest,
    txSendRequest,
  }: {
    chains: string[];
    requiredNamespaces: any;
    type: WalletConnectionType;
    explorerRecommendedWalletIds?: string[];
    signMsgRequest: (...args: any) => string;
    txSendRequest: (...args: any) => string;
  }) {
    this.type = type;
    this.signMsgRequest = signMsgRequest;
    this.txSendRequest = txSendRequest;
    this.requiredNamespaces = requiredNamespaces;
    this.chains = chains;
    this.web3Modal = new WalletConnectModal({
      ...WC_PARAMS.qrModalOptions,
      explorerRecommendedWalletIds,
      projectId: WC_PARAMS.projectId,
      chains,
    });
  }

  async initClient() {
    const { client } = await UniversalProvider.init({
      relayUrl: 'wss://relay.walletconnect.com',
      projectId: WC_PARAMS.projectId,
      metadata: {
        name: 'React App',
        description: 'React App for WalletConnect',
        url: 'https://walletconnect.com/',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
      client: undefined,
    });
    this.client = client;
    return client;
  }

  get isConnected() {
    return this.client;
  }

  async getCurrentAddress() {
    return this.client.address;
  }

  // async connect() {
  //   const result = await this.provider.connect({
  //     namespaces: {
  //       eip155: {
  //         methods: ['tron_signTransaction', 'tron_signMessage'], // Tron-specific methods
  //         chains: ['tron:1'], // Chain ID for Tron mainnet
  //         events: ['accountsChanged', 'chainChanged'],
  //       },
  //     },
  //     requiredNamespaces: {
  //       // eip155: {
  //       //   methods: [
  //       //     'eth_sendTransaction',
  //       //     'eth_signTransaction',
  //       //     'eth_sign',
  //       //     'personal_sign',
  //       //     'eth_signTypedData',
  //       //   ],
  //       //   chains: ['eip155:1'],
  //       //   events: ['chainChanged', 'accountsChanged'],
  //       //   rpcMap: {
  //       //     1: `https://rpc.walletconnect.org?chainId=eip155:1&projectId=${WC_PARAMS.projectId}`,
  //       //   },
  //       // },
  //       // eip155: {
  //       //   methods: [
  //       //     'eth_sendTransaction',
  //       //     'eth_signTransaction',
  //       //     'eth_sign',
  //       //     'personal_sign',
  //       //     'eth_signTypedData',
  //       //   ],
  //       //   chains: ['eip155:1', 'eip155:10'],
  //       //   events: ['chainChanged', 'accountsChanged'],
  //       // },
  //       // solana: {
  //       //   methods: ['solana_signTransaction', 'solana_signMessage'],
  //       //   chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
  //       //   events: [],
  //       // },
  //       // polkadot: {
  //       //   methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
  //       //   chains: ['polkadot:91b171bb158e2d3848fa23a9f1c25182'],
  //       //   events: [],
  //       // },
  //       // pairingTopic: '<123...topic>', // optional topic to connect to
  //       // skipPairing: false, // optional to skip pairing ( later it can be resumed by invoking .pair())
  //     },
  //   });
  //   const r = await this.provider.request({ method: 'eth_requestAccounts' });
  //   return this.provider.address;
  // }

  getLastSession() {
    const { client } = this;
    const sessions = client
      .find({ requiredNamespaces: this.requiredNamespaces })
      .filter((s) => s.acknowledged);

    if (sessions.length) {
      // select last matching session
      return sessions[sessions.length - 1];
    }
    return null;
  }

  getAddressFromSession(session) {
    const accounts = Object.values(session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat();
    const addr = accounts[0].split(':')[2];
    return addr;
  }

  async connect() {
    const client = this.client ?? (await this.initClient());

    const { uri, approval } = await client.connect({
      requiredNamespaces: this.requiredNamespaces,
    });
    return new Promise((resolve, reject) => {
      if (uri) {
        this.web3Modal.openModal({
          uri,
          chains: this.chains,
        });
        this.web3Modal.subscribeModal((state) => {
          if (state.open === false) {
            reject(new Error('Modal is closed.'));
          }
        });
      }
      approval()
        .then((session) => {
          this.session = session;
          // We assign this variable only after we're sure we've received approval
          this.client = client;
          const accounts = Object.values(this.session.namespaces)
            .map((namespace) => namespace.accounts)
            .flat();
          this.address = accounts[0].split(':')[2];
          resolve(this.address);
        })
        .catch(reject)
        .finally(() => {
          this.web3Modal.closeModal();
        });
    });
  }

  async disconnect() {
    return;
    if (this.client && this._session) {
      await this.client.disconnect({
        topic: this.session.topic,
        reason: getSdkError('USER_DISCONNECTED'),
      });
      this.session = undefined;
    } else {
      throw new ClientNotInitializedError();
    }
  }

  // async txSend(params: TxParams) {
  //   const fromAddress = await this.connect();
  //   const toAddress = params.recipient;

  //   // Step1
  //   const tx = await buildTx(
  //     fromAddress,
  //     toAddress,
  //     params.value,
  //     params.contractAddress,
  //   );
  //   // const signedTx = await tronweb.trx.sign(tx); // Step2
  //   const signedTx = await this.provider.signTransaction(tx);
  //   // const result = await tronweb.trx.sendRawTransaction(signedTx); // Step3
  //   await broadcastService.broadcastTrx({
  //     tx: JSON.stringify(signedTx),
  //     senderAddress: fromAddress,
  //   });
  //   return tx.txID;
  // }

  async signMessage(message: string) {
    if (!this.client) {
      await this.connect();
    }
    const session = this.getLastSession();
    const { signature } = await this.signMsgRequest(
      this.client,
      session,
      message,
    );
    return signature;
  }

  async txSend(params) {
    if (!this.client) {
      await this.connect();
    }
    const session = this.getLastSession();
    const result = await this.txSendRequest(this.client, session, params);
    return result;
  }
}
