export interface IAddress {
  id: string;
  network:
    | {
        value: 'bitcoin';
        UUID: 'bitcoin';
        code: 'BTC';
        name: 'bitcoin';
      }
    | 'bitcoin';
  cdt: string;
  out: number;
  added: number;
  of: number;
  pubkeys: string[];
  address?: string;
}

export interface IAddressTransaction {
  id: string;
  addressId: string;
  amount: number;
  txHash: string;
  cdt: string;
  errorMessage: string;
  fee: number;
  hex: string;
  network: 'bitcoin';
  sigHashes: string[];
  signedCount: number;
  toAddress: string;
  toSignCount: number;
  weight: number;

  signStatus: Record<'value' | 'description', string>;
  status: Record<'value' | 'description', string>;
}

// TRANSACTION SIGN STATUS
// WAIT("wait"), // - ждем подписи
// SIGNED("signed"), // - пользователь подписал
// DECLINED("declined") // - пользователь отменил

// TRANSACTION STATUS
// PENDING("pending"),
// ERROR("error"),
// EXPIRED("expired"),
// SEND("send")
