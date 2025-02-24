import { Typography, List, ListItem } from '@mui/material';
import dayjs from 'dayjs';
import assetDict from 'dex-helpers/assets-dict';
import React from 'react';

import TransactionItem from './TransactionItem';
import TransactionItemSkeleton from './TransactionItemSkeleton';
import { useAuth } from '../../hooks/use-auth'; // Import useAuth
import { useQuery } from '../../hooks/use-query';
import { Transaction } from '../../services';
import { ITransactionWithdrawal } from '../../types';

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions: ITransactionWithdrawal[]) => {
  return transactions.reduce(
    (groups, transaction) => {
      const date = dayjs(transaction.createdAt).format('MMM DD, YYYY');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {} as Record<string, ITransactionWithdrawal[]>,
  );
};

const WithdrawalList = () => {
  const { user } = useAuth(); // Get the user from useAuth
  const projectId = user?.project?.id!; // Extract the project ID

  const txs = useQuery(Transaction.withdrawalList, [{ projectId }]); // Use projectId

  const allTransactions = txs.data?.currentPageResult || [];
  const groupedTransactions = groupTransactionsByDate(allTransactions);

  if (txs.isLoading) {
    return Array.from({ length: 8 }).map((_, i) => (
      <TransactionItemSkeleton key={i} />
    ));
  }

  if (allTransactions.length === 0) {
    return (
      <Typography textAlign="center" mt={2} color="text.secondary">
        No withdrawal transactions found.
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
          {items.map((transaction) => (
            <TransactionItem
              key={transaction.id} // Provide a key
              asset={assetDict[transaction.currency.name]}
              transaction={{
                ...transaction,
                from_address: transaction.address_from.address,
              }}
              outgoing
            />
          ))}
        </React.Fragment>
      ))}
    </List>
  );
};

export default WithdrawalList;
