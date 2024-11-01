import { TradeStatus } from 'dex-helpers';
import { AssetModel, Trade } from 'dex-helpers/types';
import { exchangeService } from 'dex-services';
import { useEffect, useState } from 'react';
import { useWalletClient } from 'wagmi';

import Stage from './stage';
import { StageStatuses } from './stage-statuses';
import { parseAddress } from '../../../../app/helpers/utils';
import { useSendTransaction } from '../../../hooks/asset/useSendTransaction';

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
  const amount = Number(trade.amount1);
  const recipient = parseAddress(from.network, trade.exchangerWalletAddress);
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

  const { data: walletClient } = useWalletClient();
  const { sendTransaction } = useSendTransaction(from);

  const initiateNewTx = () => {
    onChange(StageStatuses.requested);
    setSendTransactionFailure('');
    sendTransaction(recipient, amount, txSentHandlers);
  };

  useEffect(() => {
    if (
      value !== StageStatuses.requested &&
      walletClient &&
      trade?.status === TradeStatus.new
    ) {
      initiateNewTx();
    } else if (trade.clientTransactionHash) {
      onChange(StageStatuses.success);
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
