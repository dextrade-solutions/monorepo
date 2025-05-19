import { TradeStatus } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { useGlobalModalContext } from 'dex-ui';
import { useEffect, useState } from 'react';

import Stage from './stage';
import { StageStatuses } from './stage-statuses';
import { parseAddress } from '../../../../app/helpers/utils';
import { useSendTransaction } from '../../../hooks/asset/useSendTransaction';

export default function StageDirectTransfer({
  value,
  onChange,
  tradeId,
  depositAddress,
  amount,
  tradeStatus,
  transactionHash,
  from,
}: {
  transactionHash?: string;
  amount: number;
  tradeId: string;
  depositAddress: string;
  from: AssetModel;
  tradeStatus: TradeStatus;
  value: StageStatuses | null;
  onChange: (status: StageStatuses, txHash?: string) => void;
}) {
  const { hideModal } = useGlobalModalContext();
  const recipient = parseAddress(from.network, depositAddress);
  const [sendTransactionFailure, setSendTransactionFailure] = useState('');

  useEffect(() => {
    if (value === StageStatuses.requested) {
      const timer = setTimeout(() => {
        onChange(StageStatuses.overwaited);
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [value]);

  const getTradeExtra = () => {
    const tradeStore = window.localStorage.getItem(tradeId);
    const tradeData = tradeStore ? JSON.parse(tradeStore) : {};
    return {
      ...tradeData,
      commit() {
        const commitData = { ...this, commit: undefined };
        window.localStorage.setItem(tradeId, JSON.stringify(commitData));
      },
    };
  };

  const txSentHandlers = {
    onSuccess: (txHash: string) => {
      onChange(StageStatuses.success, txHash);
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
    if (!tradeData.initiated || value === StageStatuses.overwaited) {
      tradeData.initiated = true;
      tradeData.commit();
      sendTransaction(recipient, amount, txSentHandlers);
    }
    onChange(StageStatuses.requested);
  };

  useEffect(() => {
    if (value !== StageStatuses.requested && tradeStatus === TradeStatus.new) {
      // initiateNewTx();
    } else if (transactionHash) {
      onChange(StageStatuses.success);
      hideModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeStatus]);

  return (
    <Stage
      onRequest={initiateNewTx}
      sendTransactionFailure={sendTransactionFailure}
      status={value}
    />
  );
}
