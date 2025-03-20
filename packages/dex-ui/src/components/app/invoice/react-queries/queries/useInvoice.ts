import { useQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';

import { Api } from '../../services/api';
import { Invoice } from '../../types/invoices';

export default function useInvoice(query: Invoice.View.Query) {
  const result = useQuery<Invoice.View.Response>({
    queryKey: ['dexpay-invoice', { id: query.id }],
    queryFn: () => {
      return Api.Invoice.paymentGet(query);
    },
    refetchInterval: 10 * SECOND,
  });
  return result;
}
