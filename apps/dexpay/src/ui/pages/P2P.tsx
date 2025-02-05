import { Button, Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { FormInputIcon, PersonStanding, Plus } from 'lucide-react';
import { useState } from 'react';

import TradingPair from '../components/crypto/TradingPair';

export default function P2P() {
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
