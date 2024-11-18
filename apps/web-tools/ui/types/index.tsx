import { Connector } from 'wagmi';

export type AssetAccount = {
  address: string;
  redeemAddress?: string;
  refundAddress?: string;
  icon?: string;
  connectedWallet?: string;
  connector?: Connector;
};
