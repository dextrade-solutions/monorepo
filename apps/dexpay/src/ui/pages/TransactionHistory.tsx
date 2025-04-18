import { Tab, Box } from '@mui/material';
import React, { useState } from 'react';

import DepositList from '../components/transaction/DepositList';
import TransactionList from '../components/transaction/TransactionList';
import WidthdrawalList from '../components/transaction/WidthdrawalList';
import Tabs from '../components/ui/Tabs';

export default function TransactionHistory() {
  const [activeTab, setActiveTab] = useState('all');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="transaction tabs"
          variant="fullWidth"
        >
          <Tab label="All" value="all" />
          <Tab label="Deposits" value="deposits" />
          <Tab label="Withdrawals" value="withdrawals" />
        </Tabs>
      </Box>

      <Box>
        {activeTab === 'all' && <TransactionList />}
        {activeTab === 'deposits' && <DepositList />}
        {activeTab === 'withdrawals' && <WidthdrawalList />}
      </Box>
    </Box>
  );
}
