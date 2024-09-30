import { Alert, Box, Button, Typography } from '@mui/material';
import { formatFundsAmount } from 'dex-helpers';
import { useEffect, useRef, useState } from 'react';
import { formatUnits, parseEther } from 'viem';
import { useReadContract, useWalletClient, useWriteContract } from 'wagmi';

import Stage from './stage';
import { StageStatuses } from './stage-statuses';
import { ERC20 } from '../../../../app/constants/abi';
import {
  BUILT_IN_NETWORKS,
  ExchangeP2PStatus,
} from '../../../../app/constants/p2p';
import { AssetModel, Trade } from '../../../../app/types/p2p-swaps';

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
  const { writeContract } = useWriteContract();
  const { data: walletClient } = useWalletClient();
  const [sendTransactionFailure, setSendTransactionFailure] = useState('');

  const toSpendAmount = BigInt(parseEther(String(trade.amount1)));
  const tokenApproval = useReadContract({
    abi: ERC20,
    chainId: from.chainId,
    address: from.contract,
    functionName: 'allowance',
    args: [
      walletClient?.account.address,
      BUILT_IN_NETWORKS[from.network]?.atomicSwapContract,
    ],
  });

  const approveSpendAmount = () => {
    onChange(StageStatuses.requested);
    writeContract(
      {
        abi: ERC20,
        chainId: from.chainId,
        address: from.contract,
        functionName: 'approve',
        args: [
          BUILT_IN_NETWORKS[from.network].atomicSwapContract,
          toSpendAmount,
        ],
      },
      {
        onSuccess: (txHash) => {
          onChange(StageStatuses.success);
        },
        onError: (e) => {
          setSendTransactionFailure(e.message);
          onChange(StageStatuses.failed);
        },
      },
    );
  };

  useEffect(() => {
    if (
      value !== StageStatuses.requested &&
      walletClient &&
      from.contract &&
      trade?.status === ExchangeP2PStatus.new &&
      !tokenApproval.isLoading &&
      tokenApproval?.data < toSpendAmount
    ) {
      approveSpendAmount();
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
      onRequest={approveSpendAmount}
      sendTransactionFailure={sendTransactionFailure}
      status={value}
    />
  );
}
