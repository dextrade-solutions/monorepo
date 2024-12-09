import { useQuery } from '@tanstack/react-query';
import { NetworkNames } from 'dex-helpers';
import { hexToNumber, formatUnits } from 'viem';
import { useEstimateFeesPerGas, useEstimateGas } from 'wagmi';

import { generateTxParams } from '../../app/helpers/transactions';
import P2PService from '../../app/services/p2p-service';
import {
  FeeParams,
  PublicFeeParams,
  EstimatedFeeParamsToken,
  EstimatedFeeParamsEth,
} from '../types';

const useWCFee = ({ asset, amount = 0, from, to }: FeeParams) => {
  const chainId = asset.chainId ? hexToNumber(asset.chainId) : undefined;
  const estimateFeePerGas = useEstimateFeesPerGas({ chainId });

  const txParams = generateTxParams({
    asset,
    amount,
    from,
    to,
  });

  let bufferMultiplier = 1;
  if (txParams.data) {
    bufferMultiplier = 2;
  }

  const estimateGas = useEstimateGas({
    chainId,
    account: txParams.from,
    to: txParams.to,
    data: txParams.data,
    value: txParams.value,
  });

  if (estimateGas.data && estimateFeePerGas.data) {
    const fee =
      Number(
        formatUnits(estimateGas.data * estimateFeePerGas.data.maxFeePerGas, 18),
      ) * bufferMultiplier;

    return {
      fee,
      loading: false,
    };
  }

  return {
    loading: true,
  };
};

const useSolFee = (params: FeeParams) => {
  return {
    fee: 0,
    loading: false,
  };
};

export const useDexTradeFee = (params: PublicFeeParams) => {
  const { data, isLoading } = useQuery({
    queryKey: ['public-get-market-fee', params],
    queryFn: () => P2PService.publicGetMarketFee(params),
  });

  return {
    fee: data?.data.data.network_cost,
    loading: isLoading,
  };
};

export const useEstimatedFee = (
  params: EstimatedFeeParamsToken | EstimatedFeeParamsEth,
) => {
  const { data, isLoading } = useQuery({
    queryKey: ['estimate-fee', params],
    queryFn: () => P2PService.estimateFee(params),
  });

  return {
    fee: formatUnits(data?.data || 0, 18),
    loading: isLoading,
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
