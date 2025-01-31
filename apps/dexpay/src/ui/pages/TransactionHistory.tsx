import { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import TransactionList from '../components/transaction/TransactionList';

export default function TransactionHistory() {
  const [activeTab, setActiveTab] = useState('all');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ maxWidth: 'md', mx: 'auto' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="transaction tabs"
          variant="fullWidth"
        >
          <Tab label="All" value="all" />
          <Tab label="Withdrawals" value="withdrawals" />
        </Tabs>
      </Box>

      <Box sx={{ pt: 2 }}>
        {activeTab === 'all' && <TransactionList />}
        {activeTab === 'withdrawals' && <TransactionList />}
      </Box>
    </Box>
  );
}
