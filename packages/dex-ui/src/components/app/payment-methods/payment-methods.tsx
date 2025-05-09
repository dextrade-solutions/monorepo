import { Box, Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { DextradeTypes, paymentService } from 'dex-services';
import { keyBy, pick, result } from 'lodash';
import { useState, useMemo } from 'react';

import PaymentMethodForm from '../payment-method-form';

interface IProps {
  value?: DextradeTypes.PaymentMethodsModel[]; // Now always an array
  currency?: string;
  supportedIdsList?: number[];
  onSelect?: (userPaymentMethods: DextradeTypes.PaymentMethodsModel[]) => void; // Now always an array
  onClose?: () => void;
  removePaymentMethod?: (id: number) => Promise<any>;
  getUserPaymentMethods?: () => Promise<DextradeTypes.UserPaymentMethod[]>;
}

const PaymentMethods = ({
  value = [],
  currency,
  supportedIdsList,
  onSelect,
  getUserPaymentMethods = () => paymentService.listAll1().then((r) => r.data),
}: IProps) => {
  const isViewMode = !onSelect;
  const paymentMethodsQuery = useQuery({
    queryKey: ['paymentMethods', currency],
    enabled: !isViewMode,
    queryFn: (params) => {
      const [, currencyParam] = params.queryKey;
      if (currencyParam) {
        return paymentService
          .listAllBankByCurrencyId(currencyParam)
          .then((r) => r.data);
      }
      return paymentService.listAllBanks().then((r) => r.data);
    },
  });

  const {
    isLoading,
    data: userPaymentMethods = [],
    refetch,
  } = useQuery({
    queryKey: ['userPaymentMethods'],
    queryFn: getUserPaymentMethods,
  });

  const renderSkeleton = () => (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent="space-between"
          marginBottom={2}
        >
          <Skeleton width="80%" height={50} />
          <Skeleton variant="circular" width={30} height={30} />
        </Box>
      ))}
    </>
  );

  const paymentMethods = useMemo(() => {
    const result: Record<string, DextradeTypes.BankDictModel> = keyBy(
      paymentMethodsQuery.data || [],
      'paymentMethodId',
    );

    if (userPaymentMethods.length) {
      userPaymentMethods.forEach((item) => {
        result[item.paymentMethod.paymentMethodId] = {
          ...item.paymentMethod,
          userPaymentMethodId: item.userPaymentMethodId,
        };
      });
    }

    if (supportedIdsList) {
      return Object.values(pick(result, supportedIdsList));
    }
    return Object.values(result);
  }, [paymentMethodsQuery.data, userPaymentMethods, supportedIdsList]);

  const selectedPaymentMethods = paymentMethods.filter((item) =>
    value.find((i) => {
      return i.userPaymentMethodId === item.userPaymentMethodId;
    }),
  );

  const onCreated = async (
    v: DextradeTypes.PaymentMethodsModel[],
    updatedAll: boolean,
  ) => {
    refetch();
    if (updatedAll) {
      onSelect(v);
    } else if (paymentMethods.length === 1) {
      onSelect(v);
    }
    toggleCreateMode();
  };

  if (isLoading || paymentMethodsQuery.isLoading) {
    return renderSkeleton();
  }

  return (
    <Box>
      <PaymentMethodForm
        value={selectedPaymentMethods}
        paymentMethods={paymentMethods}
        currency={currency}
        onCreated={onCreated}
        isViewMode={isViewMode}
      />
    </Box>
  );
};

export default PaymentMethods;
