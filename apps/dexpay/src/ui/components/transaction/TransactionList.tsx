import { Typography, List, ListItem } from '@mui/material';
import dayjs from 'dayjs';
import assetDict from 'dex-helpers/assets-dict';
import React from 'react';

import TransactionItem from './TransactionItem';
import TransactionItemSkeleton from './TransactionItemSkeleton';
import { useQuery } from '../../hooks/use-query';
import { Transaction } from '../../services';
import { ITransaction } from '../../types';

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions) => {
  return transactions.reduce((groups, transaction) => {
    const date = dayjs(transaction.createdAt).format('MMM DD, YYYY');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});
};

const TransactionList = () => {
  const txs = useQuery(Transaction.list);

  const allTransactions = txs.data?.list.currentPageResult || [];
  const groupedTransactions = groupTransactionsByDate(allTransactions);

  if (txs.isLoading) {
    return Array.from({ length: 8 }).map((i) => (
      <TransactionItemSkeleton key={i} />
    ));
  }

  if (allTransactions.length === 0) {
    return (
      <Typography textAlign="center" mt={2} color="text.secondary">
        No transactions found.
      </Typography>
    );
  }

  return (
    <List sx={{ width: '100%' }}>
      {Object.entries(groupedTransactions).map(([date, items]) => (
        <React.Fragment key={date}>
          <ListItem sx={{ py: 1.5 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {date}
            </Typography>
          </ListItem>
          {items.map((transaction: ITransaction) => (
            <React.Fragment key={transaction.id}>
              <TransactionItem
                asset={assetDict[transaction.currency.name]}
                transaction={transaction}
              />
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </List>
  );
};

export default TransactionList;
