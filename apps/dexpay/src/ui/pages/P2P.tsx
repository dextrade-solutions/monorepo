import { Button, Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

import TradingPair from '../components/crypto/TradingPair';
import { ROUTE_P2P_CREATE } from '../constants/pages';
import React from 'react';
import { bgPrimaryGradient } from 'dex-ui';

export default function P2P() {
  const [_, navigate] = useLocation();
  const [tabValue, setTabValue] = useState('pairs');

  return (
    <Box sx={{ mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{ textAlign: 'center', bgcolor: 'secondary.dark', p: 2, mb: 5 }}
      >
        <Typography variant="body2" color="textSecondary">
          Total income
        </Typography>
        <Typography m={3} variant="h4" fontWeight="bold" color="text.tertiary">
          {formatCurrency('0', 'usd')} USD
        </Typography>

        <Box display="flex" gap={2}>
          <Button
            fullWidth
            color="secondary"
            size="large"
            sx={{ background: bgPrimaryGradient }}
            variant="contained"
            startIcon={<Plus />}
            onClick={() => navigate(ROUTE_P2P_CREATE)}
          >
            Create ad
          </Button>
        </Box>
      </Paper>

      <Tabs
        value={tabValue}
        onChange={(event, newValue) => setTabValue(newValue)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Pairs" value="pairs" />
        <Tab label="Trades History" value="trades" />
      </Tabs>

      <Box mt={2}>
        {tabValue === 'pairs' && <TradingPair />}
        {tabValue === 'trades' && <TradingPair />}
      </Box>
    </Box>
  );
}
