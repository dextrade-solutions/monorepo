import { Buffer } from 'buffer';

import { addHexPrefix } from 'ethereumjs-util';
import { SendMode, internal } from '@ton/core';
import { hexToBN } from '@metamask/controller-utils';
import { TxParams } from '../../../../../shared/constants/transaction';

import { FeeParams } from '../types';
import { GasEstimateTypes } from '../../../../../shared/constants/gas';
import { hexToDecimal } from '../../../../../shared/modules/conversion.utils';
import TonController from '.';

export default class TxController {
  private tonController: TonController;

  constructor(tonController: TonController) {
    this.tonController = tonController;
  }

  async buildTransfer(txParams: TxParams) {
    const hdKey = await this.tonController.deriveHdKey(0);
    const { wallet, contract, keyPair } =
      this.tonController.getTonWalletAndContract(hdKey);
    const seqno = await contract.getSeqno();
    // this.tonController.client.get
    const msg = internal({
      value: hexToBN(txParams.value),
      to: txParams.to,
      bounce: false,
    });
    const transfer = contract.createTransfer({
      seqno,
      secretKey: Buffer.from(keyPair.secretKey),
      sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      messages: [msg],
    });
    const { source_fees: fees } =
      await this.tonController.client.estimateExternalMessageFee(
        wallet.address,
        {
          body: transfer,
          initCode: null,
          initData: null,
          ignoreSignature: true,
        },
      );
    const estimateFee =
      fees.fwd_fee + fees.gas_fee + fees.in_fwd_fee + fees.storage_fee;
    return { transfer, estimateFee, contract, wallet, seqno };
  }

  async approveTransaction(txMeta: any) {
    const { txParams } = txMeta;
    const { transfer, contract, seqno } = await this.buildTransfer(txParams);
    await this.tonController.client.sendExternalMessage(contract, transfer);

    txMeta.seqno = seqno;

    return null;
  }

  fetchGasFeeEstimateData() {
    // temporary solution
    return {
      gasFeeEstimates: {},
      gasEstimateType: GasEstimateTypes.tron,
    };
  }

  async addTxFeeDefaults(txMeta: any) {
    const feeParams = await this.getFee(txMeta.txParams);
    const hexedFeeParams = Object.entries(feeParams).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: addHexPrefix(value.toString(16)),
      }),
      {},
    );
    txMeta.txParams.feeParams = hexedFeeParams;
    return txMeta;
  }

  async getFee(txParams: TxParams): Promise<FeeParams> {
    const { estimateFee } = await this.buildTransfer(txParams);
    return {
      feeLimit: estimateFee,
    };
  }

  async simpleSend(txParams: TxParams) {
    const hdKey = await this.tonController.deriveHdKey(0);
    const { wallet, contract, keyPair } =
      this.tonController.getTonWalletAndContract(hdKey);
    const seqno = await contract.getSeqno();
    const transfer = contract.createTransfer({
      seqno,
      secretKey: Buffer.from(keyPair.secretKey),
      sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      messages: [
        internal({
          value: hexToBN(txParams.value),
          to: txParams.to,
          bounce: false,
        }),
      ],
    });
    const txHash = transfer.hash().toString('hex');
    await this.tonController.client.sendExternalMessage(wallet, transfer);
    return txHash;
  }

  async transfer(txParams: {
    data: string;
    localId: string;
    from: string;
    to: string;
    feeParams: FeeParams;
  }) {
    const { privateKey } = await this.getCurrentAccountKeys();
    const { nativeAddress } = this.getCurrentAccount();

    this.client.setAddress(nativeAddress);
    this.client.setPrivateKey(privateKey);

    const { toAddress, tokenAmount } =
      this.sharedProvider.parseTokenTransferData(txParams.data);
    const abi = await this.abi(txParams.to);
    const result = await abi.transfer(toAddress, tokenAmount.toString()).send({
      feeLimit: hexToDecimal(txParams.feeParams.feeLimit),
    });
    return result;
  }
}
