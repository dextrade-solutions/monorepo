import { hexToNumber, formatUnits } from 'viem';
import { useEstimateFeesPerGas, useEstimateGas } from 'wagmi';

import { generateTxParams } from '../../app/helpers/transactions';
import { AssetModel } from '../../app/types/p2p-swaps';

type FeeParams = {
  asset: AssetModel;
  amount: string | number;
  from: string;
  to: string;
};

export const useFee = ({ asset, amount, from, to }: FeeParams) => {
  const chainId = asset.chainId ? hexToNumber(asset.chainId) : null;
  const estimateFee = useEstimateFeesPerGas({ chainId });

  const txParams = generateTxParams({
    asset,
    amount,
    from,
    to,
  });

  let bufferMultiplier = 1;
  if (txParams.data) {
    bufferMultiplier = 1.5;
  }

  const estimateGas = useEstimateGas({ chainId, ...txParams });
  if (estimateGas.data && estimateFee.data) {
    const fee =
      Number(
        formatUnits(estimateGas.data * estimateFee.data.maxFeePerGas, 18),
      ) * bufferMultiplier;

    return {
      fee,
      feeNormalized: fee,
      amountWithFeeExcluded: Number(amount) - fee,
      loading: false,
    };
  }
  return {
    loading: true,
  };
};
