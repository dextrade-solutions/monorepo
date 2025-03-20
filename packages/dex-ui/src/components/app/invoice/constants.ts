import { METAMASK, PHANTOM, SOLFLARE, TRUSTWALLET } from "dex-connect";

export enum InvoiceStatus {
  pending = 1,
  canceled = 2,
  success = 3,
  unknwn = 4,
  expired = 5,
}

export const PAYMENT_QR_SUPPORTED = {
  BTC: [TRUSTWALLET],
  ETH: [METAMASK, TRUSTWALLET],
  USDT_ETH: [METAMASK, TRUSTWALLET],
  BNB_BSC: [METAMASK, TRUSTWALLET],
  USDT_BSC: [METAMASK, TRUSTWALLET],
  TRX: [TRUSTWALLET],
  SOL: [TRUSTWALLET, PHANTOM, SOLFLARE],
  USDT_SOL: [PHANTOM, SOLFLARE],
};
