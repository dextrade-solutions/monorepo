import { exchangeService } from 'dex-services';
import { useEffect, useState } from 'react';
import { useSwitchChain, useWalletClient } from 'wagmi';

import Stage from './stage';
import { StageStatuses } from './stage-statuses';
import { ExchangeP2PStatus } from '../../../../app/constants/p2p';
import { AssetModel, Trade } from '../../../../app/types/p2p-swaps';

export default function StageInitiateSafe({
  trade,
  from,
  value,
  onChange,
  initiateNewSwap,
}: {
  trade: Trade;
  from: AssetModel;
  value: StageStatuses | null;
  initiateNewSwap: () => void;
  onChange: (status: StageStatuses) => void;
}) {
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const [sendTransactionFailure, setSendTransactionFailure] = useState('');
  const txSentHandlers = {
    onSuccess: (txHash: string) => {
      onChange(StageStatuses.success);
      exchangeService.clientSendSafe({
        exchangeId: trade.id,
        transactionHash: txHash,
        address: trade.exchangerWalletAddress,
        amount: trade.exchangerConfirmedAmount,
      });
    },
    onError: (e) => {
      onChange(StageStatuses.failed);
      setSendTransactionFailure(e.message);
    },
  };

  const makeAtomicSwap = async () => {
    initiateNewSwap(txSentHandlers.onSuccess, txSentHandlers.onError);
  };

  const initiateNewTx = () => {
    onChange(StageStatuses.requested);
    setSendTransactionFailure('');
    switchChain(
      { chainId: from.chainId },
      {
        onSuccess: makeAtomicSwap,
        onError: (e) => {
          console.error(e);
          // try execute makeTransaction without switching
          makeAtomicSwap();
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
    } else if (trade.clientSafe || trade.exchangerSafe) {
      onChange(StageStatuses.success);
    }
  }, [trade]);

  return (
    <Stage
      title="Initiate safe"
      onRequest={initiateNewTx}
      sendTransactionFailure={sendTransactionFailure}
      status={value}
    />
  );
}
