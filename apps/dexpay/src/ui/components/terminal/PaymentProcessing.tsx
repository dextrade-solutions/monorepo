import { AssetModel } from 'dex-helpers/types';
import { InvoiceView, useInvoice } from 'dex-ui';
import React from 'react';

import { IInvoiceFull } from '../../types';

export default function PaymentProcessing({
  invoiceId,
}: {
  asset: AssetModel;
  invoiceId: string;
}) {
  const invoice = useInvoice({ id: invoiceId });

  if (invoice.isLoading) {
    return 'Loading';
  }

  if (invoice.isError) {
    return 'Something went wrong. Invoice is not created...';
  }

  return (
    <InvoiceView
      showInvoiceUrlQr
      showQrListItem
      hideHeader
      invoice={invoice.data as IInvoiceFull}
    />
  );
}
