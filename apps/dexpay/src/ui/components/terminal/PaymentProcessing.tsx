import { AssetModel } from 'dex-helpers/types';
import { InvoiceView } from 'dex-ui';
import React from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useQuery } from '../../hooks/use-query';
import { Invoice } from '../../services';
import { IInvoiceFull } from '../../types';

export default function PaymentProcessing({
  asset,
  invoiceId,
}: {
  asset: AssetModel;
  invoiceId: string;
}) {
  const invoice = useQuery(
    Invoice.paymentGet,
    [
      {
        id: invoiceId,
      },
    ],
    { refetchInterval: 3000 },
  );

  if (invoice.isLoading) {
    return 'Loading';
  }

  if (invoice.isError) {
    return 'Something went wrong. Invoice is not created...';
  }

  return <InvoiceView hideHeader invoice={invoice.data as IInvoiceFull} />;
}
