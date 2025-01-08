import { Typography } from '@mui/material';
import { formatFundsAmount, TradeStatus } from 'dex-helpers';
import { AssetModel, Trade } from 'dex-helpers/types';
import { useEffect, useState } from 'react';
import { formatUnits, parseEther } from 'viem';

import Stage from './stage';
import { StageStatuses } from './stage-statuses';
import useAllowance from '../../../hooks/evm/useAllowance';

export default function AllowanceStage({
  trade,
  from,
  value,
  onChange,
}: {
  trade: Trade;
  from: AssetModel;
  value: StageStatuses | null;
  onChange: (status: StageStatuses) => void;
}) {
  const { approveSpendAmount, tokenApproval } = useAllowance(from);
  const [sendTransactionFailure, setSendTransactionFailure] = useState('');

  const toSpendAmount = BigInt(parseEther(String(trade.amount1)));

  const txSentHandlers = {
    onError: (e) => {
      onChange(StageStatuses.failed);
      setSendTransactionFailure(e.shortMessage || e.message);
    },
  };

  const initiate = () => {
    onChange(StageStatuses.requested);
    return approveSpendAmount(toSpendAmount, txSentHandlers);
  };

  useEffect(() => {
    if (
      value !== StageStatuses.requested &&
      from.contract &&
      trade?.status === TradeStatus.new &&
      !tokenApproval.isLoading &&
      tokenApproval?.data < toSpendAmount
    ) {
      initiate();
    }

    if (tokenApproval?.data >= toSpendAmount) {
      onChange(StageStatuses.success);
    }
  }, [trade, from, tokenApproval.isLoading]);

  return (
    <Stage
      title="Allowance"
      subtitle={
        Boolean(tokenApproval.data) && (
          <Typography color="text.secondary">
            Approved:{' '}
            {formatFundsAmount(
              formatUnits(tokenApproval.data, from.decimals),
              from.symbol,
            )}
          </Typography>
        )
      }
      loading={tokenApproval.isLoading}
      onRequest={initiate}
      sendTransactionFailure={sendTransactionFailure}
      status={value}
    />
  );
}
