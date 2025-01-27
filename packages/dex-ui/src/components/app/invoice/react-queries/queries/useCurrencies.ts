import { useQuery } from '@tanstack/react-query';

import { Api } from '../../services/api';
import { Invoice } from '../../types/invoices';

export default function useCurrencies() {
  return useQuery<Invoice.Currencies.Response>({
    queryKey: ['dexpay-currencies'],
    queryFn: () => {
      return Api.Invoice.currencies();
    },
  });
}
