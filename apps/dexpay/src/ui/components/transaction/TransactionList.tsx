import { ChevronUp, ChevronDown } from 'lucide-react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import React from 'react';

const transactions = [
  {
    type: 'send',
    to: '0x8b793...246F8dD',
    amount: '-0.000148 BNB',
    date: 'Dec 11, 2024',
  },
  {
    type: 'send',
    to: '0x8b793...246F8dD',
    amount: '-0.00015 BNB',
    date: 'Dec 11, 2024',
  },
  {
    type: 'receive',
    from: 'TW8xAzJ...JiFNgmi',
    amount: '+0.000001 TRX',
    date: 'Nov 20, 2024',
  },
  {
    type: 'send',
    to: 'TRXcWFg...4TUWgmi',
    amount: '-4.542668 TRX',
    date: 'Nov 20, 2024',
  },
  {
    type: 'send',
    to: '0x7Dbc4...57AF435',
    amount: '-30,000,000,000,000,000,000 XDC',
    status: 'Pending',
    date: 'Oct 30, 2024',
  },
  {
    type: 'send',
    to: '0x8b71d...cfE71db',
    amount: '-0.004 BNB',
    date: 'Oct 30, 2024',
  },
];

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions) => {
  return transactions.reduce((groups, transaction) => {
    const { date } = transaction;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});
};

const TransactionList = () => {
  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <List sx={{ width: '100%' }}>
      {Object.entries(groupedTransactions).map(([date, transactions]) => (
        <React.Fragment key={date}>
          <ListItem sx={{ py: 1.5, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" color="text.secondary">
              {date}
            </Typography>
          </ListItem>
          {transactions.map((transaction, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  {transaction.type === 'send' ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Typography variant="body1" component="span">
                        {transaction.type === 'send'
                          ? `To: ${transaction.to}`
                          : `From: ${transaction.from}`}
                      </Typography>
                      <Typography
                        variant="body1"
                        component="span"
                        sx={{
                          color: transaction.amount.startsWith('+')
                            ? 'success.main'
                            : 'error.main',
                        }}
                      >
                        {transaction.amount}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 1,
                      }}
                    >
                      {transaction.status && (
                        <Typography variant="body2" color="text.secondary">
                          {transaction.status}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < transactions.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </List>
  );
};

export default TransactionList;
