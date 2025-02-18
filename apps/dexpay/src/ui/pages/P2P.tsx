import { Button, Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

import TradingPair from '../components/crypto/TradingPair';
import { ROUTE_P2P_CREATE } from '../constants/pages';

export default function P2P() {
  const [_, navigate] = useLocation();
  const [tabValue, setTabValue] = useState('pairs');

  return (
    <Box sx={{ mx: 'auto' }}>
      <Box mb={4}>
        <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Total income
          </Typography>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            $120.00 USD
          </Typography>
        </Paper>
        <Button
          startIcon={<Plus />}
          color="secondary"
          size="large"
          variant="contained"
          fullWidth
          onClick={() => navigate(ROUTE_P2P_CREATE)}
        >
          Create pair
        </Button>
      </Box>

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
