import { Typography, Button, Box, Paper, Skeleton } from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import {
  bgPrimaryGradient,
  CircleNumber,
  Icon,
  useGlobalModalContext,
} from 'dex-ui';
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
        <Paper
          elevation={0}
          sx={{ textAlign: 'center', bgcolor: 'secondary.dark', p: 2, mb: 1 }}
        >
          <Typography variant="body2" color="textSecondary">
            Total income
          </Typography>
          <Box display="flex" justifyContent="center" m={3}>
            {statistic.data ? (
              <Typography
                variant="h4"
                fontWeight="bold"
                color="text.tertiary"
                data-testid="merchant-income-amount"
              >
                {formatCurrency(statistic.data.received.total_usdt, 'usd')} USD
              </Typography>
            ) : (
              <Skeleton width={100} height={60} />
            )}
          </Box>
          <Box display="flex" gap={2}>
            <Button
              fullWidth
              color="secondary"
              size="large"
              sx={{ background: bgPrimaryGradient }}
              variant="contained"
              startIcon={<Icon name="tag" />}
              onClick={() => {
                navigate(ROUTE_INVOICE_CREATE);
              }}
              data-testid="merchant-new-invoice-button"
            >
              New invoice
            </Button>
            <Button
              fullWidth
              size="large"
              color="tertiary"
              variant="contained"
              startIcon={
                <CircleNumber
                  color="rgba(255, 255, 255, 0.2)"
                  size={25}
                  number={salespersonsCount}
                />
              }
              onClick={() => {
                showModal({ name: 'SALESPERSONS' });
              }}
              data-testid="merchant-salespersons-button"
            >
              Salespeople
            </Button>
          </Box>
        </Paper>
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
