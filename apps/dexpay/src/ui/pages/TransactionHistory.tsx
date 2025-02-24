import { useState } from 'react';
import { Tab, Box } from '@mui/material';
import TransactionList from '../components/transaction/TransactionList';
import WidthdrawalList from '../components/transaction/WidthdrawalList';
import Tabs from '../components/ui/Tabs';

export default function TransactionHistory() {
  const [activeTab, setActiveTab] = useState('all');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ maxWidth: 'md', mx: 'auto' }}>
      <Box sx={{ borderColor: 'divider' }}>
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

      <Box>
        {activeTab === 'all' && <TransactionList />}
        {activeTab === 'withdrawals' && <WidthdrawalList />}
      </Box>
    </Box>
  );
}
