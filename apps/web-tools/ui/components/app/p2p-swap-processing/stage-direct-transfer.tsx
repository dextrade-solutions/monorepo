import { TradeStatus } from 'dex-helpers';
import { AssetModel, Trade } from 'dex-helpers/types';
import { exchangeService } from 'dex-services';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

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
      setSendTransactionFailure(e.shortMessage);
    },
  };

  const { sendTransaction } = useSendTransaction(from);

  const initiateNewTx = () => {
    const tradeStore = window.localStorage.getItem(trade.id);
    const tradeData = tradeStore ? JSON.parse(tradeStore) : {};
    onChange(StageStatuses.requested);

    if (sendTransactionFailure) {
      setSendTransactionFailure('');
      tradeData.initiated = false;
    }

    if (!tradeData.initiated) {
      tradeData.initiated = true;
      window.localStorage.setItem(trade.id, JSON.stringify(tradeData));
      sendTransaction(recipient, amount, txSentHandlers);
    }
  };

  useEffect(() => {
    if (
      value !== StageStatuses.requested &&
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
