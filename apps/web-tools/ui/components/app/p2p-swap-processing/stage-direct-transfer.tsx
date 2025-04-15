import { TradeStatus } from 'dex-helpers';
import { AssetModel, Trade } from 'dex-helpers/types';
import { exchangeService } from 'dex-services';
import { useGlobalModalContext } from 'dex-ui';
import { useEffect, useState } from 'react';

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
  const { hideModal } = useGlobalModalContext();
  const amount = Number(trade.amount1);
  const recipient = parseAddress(from.network, trade.exchangerWalletAddress);
  const [sendTransactionFailure, setSendTransactionFailure] = useState('');

  const getTradeExtra = () => {
    const tradeStore = window.localStorage.getItem(trade.id);
    const tradeData = tradeStore ? JSON.parse(tradeStore) : {};
    return {
      ...tradeData,
      commit() {
        const commitData = { ...this, commit: undefined };
        window.localStorage.setItem(trade.id, JSON.stringify(commitData));
      },
    };
  };

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
      const tradeData = getTradeExtra();
      tradeData.initiated = false;
      tradeData.commit();
      setSendTransactionFailure(e.shortMessage || e.message);
    },
  };

  const { sendTransaction } = useSendTransaction(from);

  const initiateNewTx = () => {
    const tradeData = getTradeExtra();

    if (sendTransactionFailure) {
      setSendTransactionFailure('');
    }

    if (!tradeData.initiated) {
      tradeData.initiated = true;
      tradeData.commit();
      sendTransaction(recipient, amount, txSentHandlers);
    }
    onChange(StageStatuses.requested);
  };

  useEffect(() => {
    if (
      value !== StageStatuses.requested &&
      trade?.status === TradeStatus.new
    ) {
      // initiateNewTx();
    } else if (trade.clientTransactionHash) {
      onChange(StageStatuses.success);
      hideModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trade]);

  return (
    <Stage
      onRequest={initiateNewTx}
      sendTransactionFailure={sendTransactionFailure}
      status={value}
    />
  );
}
