import {
  Button,
  Paper,
  Typography,
  Box,
  Skeleton,
  CardContent,
  Card,
} from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import { bgPrimaryGradient } from 'dex-ui';
import { range, sumBy } from 'lodash';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import React from 'react';
import { useLocation } from 'wouter';

import AssetList from '../components/crypto/AssetList';
import {
  ROUTE_WALLET_DEPOSIT,
  ROUTE_WALLET_WITHDRAW,
} from '../constants/pages';
import { useCurrencies } from '../hooks/use-currencies';

export default function Wallet() {
  const [_, navigate] = useLocation();
  const { items, isLoading } = useCurrencies();

  const totalBalance = sumBy(items, 'balance.total_balance_usdt');
  return (
    <Box>
      <Box mb={4}>
        <Paper
          elevation={0}
          sx={{ textAlign: 'center', bgcolor: 'secondary.dark', p: 2, mb: 1 }}
        >
          <Typography variant="body2" color="textSecondary">
            Current balance
          </Typography>
          <Typography
            m={3}
            variant="h4"
            fontWeight="bold"
            color="text.tertiary"
          >
            {formatCurrency(totalBalance, 'usd')} USD
          </Typography>

          <Box display="flex" gap={2}>
            <Button
              fullWidth
              color="secondary"
              size="large"
              sx={{ background: bgPrimaryGradient }}
              variant="contained"
              startIcon={<ArrowDownLeft />}
              onClick={() => navigate(ROUTE_WALLET_DEPOSIT)}
            >
              Deposit
            </Button>
            <Button
              fullWidth
              size="large"
              color="tertiary"
              variant="contained"
              startIcon={<ArrowUpRight />}
              onClick={() => navigate(ROUTE_WALLET_WITHDRAW)}
            >
              Withdraw
            </Button>
          </Box>
        </Paper>
      </Box>
      <Box>
        <Typography
          variant="h6"
          fontWeight="600"
          gutterBottom
          mb={2}
          color="text.tertiary"
        >
          Assets
        </Typography>
        {isLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {range(10).map(() => (
              <Card
                elevation={0}
                sx={{ borderRadius: 1, bgcolor: 'secondary.dark' }}
              >
                <CardContent
                  sx={{ p: 2, display: 'flex', alignItems: 'center' }}
                >
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    sx={{ mr: 2 }}
                  />
                  <Box>
                    <Skeleton height={20} width={80} />
                    <Skeleton height={16} width={50} sx={{ mt: 0.5 }} />
                  </Box>
                  <Box sx={{ marginLeft: 'auto' }}>
                    {' '}
                    {/* Push balance to the right */}
                    <Skeleton height={20} width={60} />
                    <Skeleton height={16} width={40} sx={{ mt: 0.5 }} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {!isLoading && <AssetList items={items} />}
      </Box>
    </Box>
  );
}
