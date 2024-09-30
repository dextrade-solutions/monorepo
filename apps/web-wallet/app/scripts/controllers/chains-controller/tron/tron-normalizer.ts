import TronWeb from 'tronweb-fetch/dist/TronWeb';
import BN from 'bn.js';
import {
  TransactionStatus,
  TransactionType,
} from '../../../../../shared/constants/transaction';
import { bnToHex } from '../../../../../shared/modules/conversion.utils';
import createId from '../../../../../shared/modules/random-id';
import { getTokenIdLocal } from '../../../../../shared/lib/token-util';
import {
  INormalizeIncomeTransaction,
  ResponseTRC20TxData,
  ResponseTRXTxData,
} from './types';

interface ITronNormalizer {
  selectedAddress: string;
  chainId: string;
  client: typeof TronWeb;
}

export class TronNormalizer {
  private readonly client: typeof TronWeb;

  private readonly selectedAddress: string;

  private readonly chainId: string;

  constructor({ client, selectedAddress, chainId }: ITronNormalizer) {
    this.client = client;
    this.selectedAddress = selectedAddress;
    this.chainId = chainId;
  }

  public normalizeTRXTFromRequest(
    tx: ResponseTRXTxData,
  ): INormalizeIncomeTransaction {
    const contract = tx.raw_data.contract[0];
    const contractParameter = contract.parameter;
    const status =
      tx.ret[0].contractRet === 'SUCCESS'
        ? TransactionStatus.confirmed
        : TransactionStatus.failed;

    const txParams = {
      from: contractParameter.value.owner_address,
      to: contractParameter.value.to_address,
      value: bnToHex(new BN(contractParameter.value.amount)),
      localId: this.chainId,
    };

    return {
      blockNumber: tx.blockNumber,
      id: createId(),
      chainId: this.chainId,
      status,
      time: tx.raw_data.timestamp,
      txParams,
      walletAddress: this.selectedAddress,
      hash: tx.txID,
      type: TransactionType.incoming,
    };
  }

  public async normalizeTRC20FromRequest(
    tx: ResponseTRC20TxData,
  ): Promise<INormalizeIncomeTransaction> {
    const {
      transaction_id: hash,
      from,
      to,
      value,
      token_info: { address },
      block_timestamp: time,
    } = tx;
    try {
      const status = TransactionStatus.confirmed;

      const txParams = {
        from,
        to,
        value: bnToHex(new BN(Number(value))),
        localId: getTokenIdLocal({
          chainId: this.chainId,
          contract: address,
        }),
      };

      return {
        id: createId(),
        chainId: this.chainId,
        status,
        time,
        txParams,
        walletAddress: this.selectedAddress,
        hash,
        type: TransactionType.incoming,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
