import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { buildTxSol } from 'dex-helpers';
import { parseUnits } from 'viem';

import { WalletConnectionType } from '../constants';
import { ConnectionProvider, TxParams } from './interface';

export function useSolanaProviders() {
  // TODO: pass context WalletProvider here!
  const { wallets, select, signMessage: signMessageWallet } = useWallet();

  const { connection } = useConnection();

  return wallets.map(
    (item): ConnectionProvider => ({
      type: WalletConnectionType.solana,
      icon: item.adapter.icon,
      name: item.adapter.name,
      id: `${item.adapter.name}:${WalletConnectionType.solana}`,
      isAuthorized() {
        return item.adapter.connected;
      },
      async connect() {
        select(item.adapter.name);
        await item.adapter.connect();
        const address = item.adapter.publicKey?.toBase58();
        if (!address) {
          throw new Error('connect solana wallet - something is wrong');
        }
        return address;
      },
      disconnect() {
        return item.adapter.disconnect();
      },
      signMessage(msg: string) {
        const msgBuffer = Buffer.from(msg);
        return signMessageWallet && signMessageWallet(msgBuffer);
      },
      async txSend(params: TxParams) {
        const { asset, amount, recipient } = params;
        select(item.adapter.name);
        if (!item.adapter.connected) {
          await this.connect();
        }

        const value = parseUnits(String(amount), asset.decimals);
        const from = item.adapter.publicKey?.toBase58();
        const transaction = await buildTxSol({
          asset,
          connection,
          from,
          recipientAddress: recipient,
          value: Number(value),
        });
        return item.adapter.sendTransaction(transaction, connection);
      },
    }),
  );
}
