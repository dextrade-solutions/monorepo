import { Button, Paper, Typography, Box } from '@mui/material';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import React from 'react';
import { useLocation } from 'wouter';

import AssetList from '../components/crypto/AssetList';
import {
  ROUTE_WALLET_DEPOSIT,
  ROUTE_WALLET_WITHDRAW,
} from '../constants/pages';

export default function Wallet() {
  const [_, navigate] = useLocation();
  return (
    <Box>
      <Box mb={4}>
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Balance
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            $1000.00 USD
          </Typography>
        </Paper>
        <Box display="flex" gap={2}>
          <Button
            fullWidth
            color="secondary"
            size="large"
            variant="contained"
            startIcon={<ArrowDownLeft />}
            onClick={() => navigate(ROUTE_WALLET_DEPOSIT)}
          >
            Deposit
          </Button>
          <Button
            fullWidth
            color="secondary"
            size="large"
            variant="contained"
            startIcon={<ArrowUpRight />}
            onClick={() => navigate(ROUTE_WALLET_WITHDRAW)}
          >
            Withdraw
          </Button>
        </Box>
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>
          Assets
        </Typography>
        <AssetList />
      </Box>
    </Box>
  );
}
