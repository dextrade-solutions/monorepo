import { Box, Skeleton } from '@mui/material';
import { AssetModel } from 'dex-helpers/types';
import { InvoiceView, QRCode } from 'dex-ui';
import React, { useEffect, useState } from 'react';

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
  const invoice = useQuery(Invoice.paymentGet, [
    {
      id: invoiceId,
    },
  ]);

  if (invoice.isLoading) {
    return 'Loading';
  }

  if (invoice.isError) {
    return 'Something went wrong. Invoice is not created...';
  }

  return <InvoiceView invoice={invoice.data as IInvoiceFull} />;
}
