import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';

import { NULLISH_TOKEN_ADDRESS } from '../../app/helpers/atomic-swaps';
import { generateTxParams } from '../../app/helpers/transactions';
import P2PService from '../../app/services/p2p-service';
import { FeeParams, PublicFeeParams } from '../types';

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

export const useEVMFee = ({ asset, amount = 0, from, to }: FeeParams) => {
  const txParams = generateTxParams({
    asset,
    amount,
    from,
    to: to || NULLISH_TOKEN_ADDRESS,
  });
  let value;
  if (typeof txParams.value === 'bigint') {
    value = formatUnits(txParams.value, 0);
    delete txParams.value;
  }
  const { data: fee, isLoading } = useQuery({
    queryKey: ['estimate-fee', txParams, value],
    queryFn: () => {
      return P2PService.estimateFee({
        contractAddress: asset.contract,
        data: txParams.data,
        from: txParams.from,
        value,
        to: asset.contract ? undefined : txParams.to,
        network: asset.network,
      }).then(({ data }) => {
        return Number(formatUnits(BigInt(data), 18));
      });
    },
  });

  return {
    fee,
    loading: isLoading,
  };
};
export const useDefaultFee = ({ asset, amount, from, to }: FeeParams) => {
  const { data: fee, isLoading } = useQuery({
    queryKey: ['estimate-fee', from, amount],
    enabled: !asset.isFiat,
    queryFn: () =>
      P2PService.estimateFee({
        contractAddress: asset.contract ? asset.contract : undefined,
        from,
        to,
        value: amount || 0,
        network: asset.network,
      }).then(({ data }) => {
        return Number(formatUnits(BigInt(data), asset.decimals));
      }),
  });

  return {
    fee,
    loading: isLoading,
  };
};
const useTransakFee = (params: FeeParams) => {
  const { data: fee, isLoading } = useQuery({
    queryKey: ['estimate-fee', params],
    queryFn: () =>
      P2PService.estimateFee({
        from: params.ad.fromCoin.ticker,
        to: params.ad.toCoin.ticker,
        toNetwork: 'bsc',
        amount: params.amount,
        network: params.ad.fromCoin.networkName,
      }).then(({ data }) => {
        return Number(formatUnits(BigInt(data), 6));
      }),
  });

  return {
    fee,
    loading: isLoading,
  };
};

const getFeeHook = (params: FeeParams) => {
  if (params.ad.provider === 'TRANSAK') {
    return useTransakFee;
  }
  if (params.asset.chainId) {
    return useEVMFee;
  }
  return useDefaultFee;
};

export const useFee = (params: FeeParams) => {
  const useFeeHook = getFeeHook(params);
  const result = useFeeHook(params);
  return result;
};
