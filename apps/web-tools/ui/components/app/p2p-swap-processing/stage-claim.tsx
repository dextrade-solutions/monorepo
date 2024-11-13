import { exchangeService } from 'dex-services';
import { useCallback, useEffect } from 'react';

import Stage from './stage';
import { StageStatuses } from './stage-statuses';
import { Trade } from '../../../../app/types/p2p-swaps';

export function StageClaim({
  value,
  trade,
  safe2,
  onChange,
  claimSwap,
}: {
  trade: Trade;
  safe2?: any;
  value: StageStatuses | null;
  onChange: (status: StageStatuses) => void;
  claimSwap: (opts: any) => void;
}) {
  const awaitingClaimSwap =
    trade.exchangerSettings.isAtomicSwap && trade.exchangerSafe;
  const loading = !trade.exchangerSafe;

  const onClaim = useCallback(() => {
    const claimSwapHandlers = {
      onSuccess: (txHash: string) => {
        onChange(StageStatuses.success);
        exchangeService.clientSendCrypto({
          id: trade.id,
          transactionHash: txHash,
        });
      },
      onError: (e) => {
        console.error(e);
        onChange(StageStatuses.failed);
      },
    };
    claimSwap({ exchangerSafe: trade.exchangerSafe, ...claimSwapHandlers });
  }, [trade, claimSwap, onChange]);

  useEffect(() => {
    if (trade.clientTransactionHash || safe2?.claimed) {
      onChange(StageStatuses.success);
    } else if (awaitingClaimSwap && value !== StageStatuses.requested) {
      onChange(StageStatuses.requested);
      onClaim();
    }
  }, [trade, awaitingClaimSwap]);

  return (
    <Stage
      loading={loading}
      title="Claiming safe"
      onRequest={onClaim}
      status={value}
    />
  );
}
