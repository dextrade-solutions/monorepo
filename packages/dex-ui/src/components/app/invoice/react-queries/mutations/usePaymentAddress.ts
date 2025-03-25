import { useMutation } from '@tanstack/react-query';
import { queryClient } from 'dex-helpers/shared';

import { Api } from '../../services/api';
import { Invoice } from '../../types/invoices';

export default function usePaymentAddress() {
  return useMutation<Invoice.View.Response, unknown, Invoice.View.Query>({
    mutationFn: (params) => {
      return Api.Invoice.paymentAddress(params);
    },
    onSuccess: async (data, variables) => {
      await queryClient.setQueryData(
        ['dexpay-invoice', { id: variables.id }],
        data,
      );
    },
  });
}
