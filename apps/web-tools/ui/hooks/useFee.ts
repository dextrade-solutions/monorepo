import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { hexToNumber, formatUnits } from 'viem';
import { useEstimateFeesPerGas, useEstimateGas } from 'wagmi';

import { generateTxParams } from '../../app/helpers/transactions';

type FeeParams = {
  asset: AssetModel;
  amount?: string | number;
  from?: string | null;
  to: string;
};

const useWCFee = ({ asset, amount = 0, from, to }: FeeParams) => {
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
    loading: false,
  };
};

const useSolFee = (params: FeeParams) => {
  return {
    fee: 1,
    loading: false,
  };
};

const getFeeHook = (params: FeeParams) => {
  if (params.asset.chainId) {
    return useWCFee;
  } else if (params.asset.network === NetworkNames.solana) {
    return useSolFee;
  }
  return () => ({ fee: 0 });
};

export const useFee = (params: FeeParams) => {
  const useFeeHook = getFeeHook(params);
  const result = useFeeHook(params);
  return result;
};
