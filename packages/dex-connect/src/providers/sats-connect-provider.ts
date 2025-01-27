import Wallet, { AddressPurpose } from 'sats-connect';
import { parseUnits } from 'viem';

import { ConnectionProvider, TxParams } from './interface';
import { WalletConnectionType } from '../constants';

type SatsAddress = {
  address: string;
  addressType: string;
  publicKey: string;
  purpose: string;
};

const getPaymentAddresses = (
  addresses: SatsAddress[],
  addressType = AddressPurpose.Payment,
) => {
  return addresses.find((address) => address.purpose === addressType);
};

export class SatsConnectProvider implements ConnectionProvider {
  type = WalletConnectionType.sats;

  get name() {
    return 'Xverse';
  }

  isAuthorized() {
    return Wallet.request('wallet_getAccount', null);
  }

  async connect() {
    const res = await Wallet.request('wallet_connect', {
      message: 'Cool app wants to know your addresses!',
      addresses: [AddressPurpose.Payment],
    });
    if (res.status === 'success') {
      const [btcAddress] = res.result.addresses.filter((a) =>
        [AddressPurpose.Payment].includes(a.purpose),
      );
      return btcAddress.address;
    }
    throw new Error(res.error.message);
  }

  async disconnect(): Promise<void> {
    await Wallet.request('wallet_disconnect', null);
  }

  async txSend(params: TxParams) {
    const response = await Wallet.request('sendTransfer', {
      recipients: [
        {
          address: params.recipient,
          amount: Number(parseUnits(String(params.amount), 8)),
        },
      ],
    });
    if (response.status === 'success') {
      return response.result.txid;
    }
    throw new Error(response.error.message);
  }

  async signMessage(message: string) {
    const response = await Wallet.request('wallet_getAccount', null);
    if (response.status === 'success') {
      const account = getPaymentAddresses(response.result.addresses);
      const result = await Wallet.request('signMessage', {
        address: account?.address,
        message,
      });
      if (result.status === 'success') {
        return result.result.signature;
      }
    }
    throw new Error('failed signing message');
  }
}
