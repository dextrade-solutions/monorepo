import Btc from '@ledgerhq/hw-app-btc';
import Solana from '@ledgerhq/hw-app-solana';
import Trx from '@ledgerhq/hw-app-trx';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { PublicKey } from '@solana/web3.js';
import { NetworkNames } from 'dex-helpers';
import { WalletAPIClient } from "@ledgerhq/wallet-api-client";
import { listen } from "@ledgerhq/logs";


class LedgerConnection {
  transport: TransportWebUSB | null = null;

  icon = '';

  name = 'LedgerLive';

  constructor() {
    listen(log => console.log(log));
  }

  async initTransport() {
    // Connect to the Ledger device using HID
    const transport = await TransportWebUSB.create();
    this.transport = transport;
  }

  connect(network: NetworkNames) {
    const connections = {
      [NetworkNames.bitcoin]: this.connectBTC.bind(this),
      [NetworkNames.solana]: this.connectSolana.bind(this),
      [NetworkNames.tron]: this.connectTron.bind(this),
    };
    if (connections[network]) {
      return connections[network]();
    }
    throw new Error(`Connection with ${network} does not exist`);
  }

  async connectTron() {
    await this.initTransport();
    const client = new Trx(this.transport);
    const result = await client.getAddress("44'/195'/0'/0/0");
    return {
      client,
      address: result.address,
      connectedWallet: this.name,
    };
  }

  async connectBTC() {
    await this.initTransport();
    try {
      // const hash = crypto.createHash("sha256")
      const btc = new Btc({ transport: this.transport, currency: 'bitcoin' });

      const path = "44'/0'/0'/0/0"; // BIP44 path for Bitcoin

      const address = await btc.getWalletPublicKey(path);

      return { address, client: btc, connectedWallet: this.name };
    } catch (error) {
      console.error('Error connecting to Ledger:', error);
      throw error;
    }
  }

  async connectSolana() {
    await this.initTransport();

    if (this.transport) {
      const client = new Solana(this.transport);
      const { address } = await client.getAddress("44'/501'/0'");
      const pubKey = new PublicKey(address);
      return {
        client,
        address: pubKey.toBase58(),
        connectedWallet: this.name,
      };
    }
    throw new Error('Ledger transport not available');
  }

  async disconnect() {
    try {
      if (this.transport) {
        await this.transport.close();
        console.log('Ledger device disconnected.');
        this.transport = null;
      } else {
        console.log('No active connection to Ledger device.');
      }
    } catch (error) {
      console.error('Error disconnecting from Ledger:', error);
    }
  }
}

export const ledgerConnection = new LedgerConnection();
