import { useQuery } from '@tanstack/react-query';

import { Invoice } from '../../../types/invoices';
import { Api } from '../../services/api';

export default function usePayment(query: Invoice.View.Query) {
  const result = useQuery<Invoice.View.Response>({
    queryKey: ['dexpay-payment'],
    queryFn: () => {
      return Api.Invoice.paymentGet(query);
    },
  });
  return result;
}
