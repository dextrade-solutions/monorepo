/* eslint-disable camelcase */
import {
  TransactionStatus,
  TransactionType,
} from '../../../../../shared/constants/transaction';
import { TxParams } from '../types';

export type TGetAccount = () => {
  nativeBalance: string;
  nativeAddress: string;
};

export interface ResTRXTxDataRet {
  contractRet: 'SUCCESS' | 'FAIL';
  fee: number;
}

export interface ResTRXTxDataRowContactParameter {
  value: {
    amount: number;
    owner_address: string;
    to_address: string;
  };
  type_url: string;
}

export interface ResTRXTxDataRowContact {
  parameter: ResTRXTxDataRowContactParameter;
  type: 'TransferContract';
}

export interface ResTRXTxDataRowData {
  contract: ResTRXTxDataRowContact[];
  ref_block_bytes: string;
  ref_block_hash: string;
  expiration: number;
  timestamp: number;
}

export interface ResponseTRXTxData {
  ret: ResTRXTxDataRet[];
  signature: string[];
  txID: string;
  net_usage: number;
  raw_data_hex: string;
  net_fee: number;
  energy_usage: number;
  blockNumber: number;
  block_timestamp: number;
  energy_fee: number;
  energy_usage_total: number;
  raw_data: ResTRXTxDataRowData;
  internal_transactions: any[];
}

export interface ResponseTRC20TxData {
  transaction_id: string;
  token_info: {
    symbol: string;
    address: string;
    decimals: number;
    name: string;
  };
  block_timestamp: number;
  from: string;
  to: string;
  type: string;
  value: number;
}

export interface INormalizeIncomeTransaction {
  blockNumber?: number;
  id: number;
  chainId: string;
  status: TransactionStatus;
  time: number;
  txParams: TxParams;
  walletAddress: string;
  hash: string;
  type: TransactionType;
}
