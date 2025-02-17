import { Typography, Button, Box, Paper, Skeleton } from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import { CircleNumber, Icon, useGlobalModalContext } from 'dex-ui';
import React from 'react';
import { useLocation } from 'wouter';

import InvoiceList from '../components/invoices/InvoiceList';
import { ROUTE_INVOICE_CREATE } from '../constants/pages';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '../hooks/use-query';
import { Projects } from '../services';
import StatsService from '../services/service.stats';

export default function Merchant() {
  const [, navigate] = useLocation();
  const { showModal } = useGlobalModalContext();

  const { user } = useAuth();

  const projectId = user?.project?.id;

  if (!projectId) {
    throw new Error('No projectId');
  }

  const statistic = useQuery(StatsService.invoices, {
    projectId,
  });

  const usersWithAccess = useQuery(Projects.getUsersWithAccess, {
    projectId,
    enabled: Boolean(user?.project.id), // Only enable the query if projectId exists
  });

  const salespersonsCount = usersWithAccess.data?.currentPageResult.length || 0;

  return (
    <Box sx={{ mx: 'auto' }} data-testid="merchant-page">
      <Box mb={4}>
        <Paper elevation={0} sx={{ mb: 1 }} data-testid="merchant-income-paper">
          <Typography
            variant="body2"
            color="textSecondary"
            data-testid="merchant-income-label"
          >
            Total income
          </Typography>
          {statistic.data ? (
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              data-testid="merchant-income-amount"
            >
              {formatCurrency(statistic.data.received.total_usdt, 'usd')} USD
            </Typography>
          ) : (
            <Skeleton width={100} height={60} />
          )}
        </Paper>

        <Box gap={2} display="flex">
          <Button
            fullWidth
            onClick={() => {
              navigate(ROUTE_INVOICE_CREATE);
            }}
            color="secondary"
            size="large"
            variant="contained"
            startIcon={<Icon name="tag" />}
            data-testid="merchant-new-invoice-button" // Added data-testid
          >
            New Invoice
          </Button>
          <Button
            sx={{ bgcolor: 'secondary.light' }}
            fullWidth
            onClick={() => {
              showModal({ name: 'SALESPERSONS' });
            }}
            color="secondary"
            size="large"
            variant="contained"
            startIcon={<CircleNumber size={25} number={salespersonsCount} />}
            data-testid="merchant-salespersons-button" // Added data-testid
          >
            Salespeople
          </Button>
        </Box>
      </Box>
      <Box data-testid="merchant-invoices-section">
        <Typography
          variant="h6"
          gutterBottom
          data-testid="merchant-invoices-label"
        >
          Invoices
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          data-testid="merchant-invoices-list"
        >
          <InvoiceList />
        </Box>
      </Box>
    </Box>
  );
}
