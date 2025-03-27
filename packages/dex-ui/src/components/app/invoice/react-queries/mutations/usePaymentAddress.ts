import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { queryClient } from 'dex-helpers/shared';

import { Api } from '../../services/api';
import { Invoice } from '../../types/invoices';

type PaymentAddressMutationParams = UseMutationOptions<
  Invoice.View.Response,
  unknown,
  Invoice.View.Query
>;

export default function usePaymentAddress(
  params?: PaymentAddressMutationParams,
) {
  return useMutation<Invoice.View.Response, unknown, Invoice.View.Query>({
    mutationFn: (data) => {
      return Api.Invoice.paymentAddress(data);
    },
    onSuccess: async (data, variables) => {
      await queryClient.setQueryData(
        ['dexpay-invoice', { id: variables.id }],
        data,
      );
    },
    ...params,
  });
}
