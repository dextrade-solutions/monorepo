/* eslint-disable camelcase */
export type BlockChainInfoOutput = {
  type: number;
  spent: boolean;
  value: number;
  spending_outpoints: {
    n: number;
    tx_index: number;
  }[];
  n: number;
  tx_index: number;
  script: string;
  addr: string;
};

export type BlockChainInfoInput = {
  sequence: number;
  witness: string;
  script: string;
  index: number;
  prev_out: {
    addr: string;
    n: number;
    script: string;
    spending_outpoints: {
      n: number;
      tx_index: number;
    }[];
    spent: boolean;
    tx_index: number;
    type: number;
    value: number;
  };
};

export type BlockChainInfoTx = {
  hash: string;
  ver: number;
  vin_sz: number;
  vout_sz: number;
  size: number;
  weight: number;
  fee: number;
  relayed_by: string;
  lock_time: number;
  tx_index: number;
  double_spend: false;
  time: number;
  block_index: number;
  block_height: number;
  inputs: BlockChainInfoInput[];
  out: BlockChainInfoOutput[];
  result: number;
  balance: number;
};

export type BlockChainInfoResponse = {
  hash160: string;
  address: string;
  n_tx: number;
  n_unredeemed: number;
  total_received: number;
  total_sent: number;
  final_balance: number;
  txs: BlockChainInfoTx[];
};

export type BlockChainInfoUnspentOutputs = {
  notice: string;
  unspent_outputs: {
    confirmations: number;
    script: string;
    tx_hash: string;
    tx_hash_big_endian: string;
    tx_index: number;
    tx_output_n: number;
    value: number;
    value_hex: string;
  }[];
};
