import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Skeleton,
} from '@mui/material';
import React from 'react';

import { InvoiceItem } from './InvoiceItem';
import { useAuth } from '../../hooks/use-auth';
import { useQuery } from '../../hooks/use-query';
import { Invoice } from '../../services';

export default function InvoiceList() {
  const { user } = useAuth();
  const invoices = useQuery(Invoice.list, { projectId: user?.project?.id });
  const renderInvoicesList = invoices.data?.currentPageResult || [];

  if (invoices.isLoading) {
    return (
      <Card
        elevation={0}
        sx={{ bgcolor: 'secondary.dark', borderRadius: 1, mb: 2 }}
      >
        <CardContent>
          <Skeleton height={20} width="60%" />
          <Skeleton height={40} width="100%" sx={{ mt: 1 }} />
          <Divider sx={{ my: 1 }} />
          <Skeleton height={20} width="100%" />
          <Skeleton height={20} width="100%" sx={{ mt: 1 }} />
          <Box display="flex" alignItems="center" mt={1}>
            <Skeleton height={36} width={80} />
            <Skeleton height={36} width={80} sx={{ ml: 1 }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!renderInvoicesList.length) {
    return (
      <Typography color="text.secondary">
        No invoices created yet. Create a new one.
      </Typography>
    );
  }

  return (
    <>
      {renderInvoicesList.map((invoice) => (
        <InvoiceItem
          key={invoice.id}
          invoice={invoice}
          onDelete={() => {
            invoices.refetch();
          }}
        />
      ))}
    </>
  );
}
