import { Box, Typography, Divider } from '@mui/material';
import { ButtonIcon, ModalProps } from 'dex-ui';
import React from 'react';

import TransactionItem from '../components/transaction/TransactionItem';
import TransactionItemSkeleton from '../components/transaction/TransactionItemSkeleton';
import { useCurrencies } from '../hooks/use-currencies';
import { ITransaction } from '../types';

interface TransactionsModalProps {
  transactions: ITransaction[];
}

const TransactionsModal: React.FC<TransactionsModalProps & ModalProps> = ({
  hideModal,
  transactions,
}) => {
  const currencies = useCurrencies();
  return (
    <Box padding={3}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Typography variant="h6">Transactions</Typography>{' '}
        <ButtonIcon
          iconName="close"
          color="secondary"
          size="sm"
          onClick={hideModal}
        />
      </Box>
      <Divider />

      {currencies.isLoading && <TransactionItemSkeleton />}

      {!currencies.isLoading &&
        transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            asset={
              currencies.items.find(
                ({ currency }) => currency.id === transaction.currency_id,
              )?.asset
            }
            transaction={transaction}
          />
        ))}
    </Box>
  );
};

export default TransactionsModal;
