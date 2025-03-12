import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Skeleton,
} from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { InvoiceItem } from './InvoiceItem';
import { useAuth } from '../../hooks/use-auth';
import { Invoice } from '../../services';

export default function InvoiceList() {
  const { user } = useAuth();
  const projectId = user?.project?.id!;
  const { ref: intersectionRef, inView } = useInView({
    threshold: 0.5,
  });
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['invoices-list'],
    queryFn: ({ pageParam = 0 }) =>
      Invoice.list({ projectId }, { page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= lastPage.totalPages - 1) {
        return undefined;
      }
      return lastPage.page + 1;
    },
  });
  const renderInvoicesList =
    data?.pages.flatMap((i) => i.currentPageResult) || [];
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
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
      {renderInvoicesList.map((invoice, index) => {
        const lastElement = renderInvoicesList.length - 1 === index;
        return (
          <Box ref={lastElement ? intersectionRef : undefined} key={invoice.id}>
            <InvoiceItem
              invoice={invoice}
              onDelete={() => {
                refetch();
              }}
            />
          </Box>
        );
      })}
      {isFetchingNextPage && (
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
      )}
    </>
  );
}
