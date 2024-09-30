import { exchangeService } from 'dex-services';
import { useEffect, useState } from 'react';
import { useSendTransaction, useSwitchChain, useWalletClient } from 'wagmi';

import Stage from './stage';
import { StageStatuses } from './stage-statuses';
import { ExchangeP2PStatus } from '../../../../app/constants/p2p';
import { generateTxParams } from '../../../../app/helpers/transactions';
import { AssetModel, Trade } from '../../../../app/types/p2p-swaps';

export default function StageDirectTransfer({
  value,
  onChange,
  trade,
  from,
}: {
  trade: Trade;
  from: AssetModel;
  value: StageStatuses | null;
  onChange: (status: StageStatuses) => void;
}) {
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { sendTransaction } = useSendTransaction();

  const [sendTransactionFailure, setSendTransactionFailure] = useState('');

  const txSentHandlers = {
    onSuccess: (txHash: string) => {
      onChange(StageStatuses.success);
      exchangeService.clientSendCrypto({
        id: trade.id,
        transactionHash: txHash,
      });
    },
    onError: (e) => {
      onChange(StageStatuses.failed);
      setSendTransactionFailure(e.message);
    },
  };

  const makeDirectTransfer = () => {
    const txParams = generateTxParams({
      asset: from,
      amount: trade.amount1,
      to: trade.exchangerWalletAddress,
    });
    sendTransaction({ ...txParams, chainId: from.chainId }, txSentHandlers);
  };

  const initiateNewTx = () => {
    onChange(StageStatuses.requested);
    setSendTransactionFailure('');
    switchChain(
      { chainId: from.chainId },
      {
        onSuccess: makeDirectTransfer,
        onError: (e) => {
          console.error(e);
          // try execute makeTransaction without switching
          makeDirectTransfer();
        },
      },
    );
  };

  useEffect(() => {
    if (
      value !== StageStatuses.requested &&
      walletClient &&
      trade?.status === ExchangeP2PStatus.new
    ) {
      initiateNewTx();
    }
  }, [trade]);

  return (
    <Stage
      onRequest={initiateNewTx}
      sendTransactionFailure={sendTransactionFailure}
      status={value}
    />
  );
}
