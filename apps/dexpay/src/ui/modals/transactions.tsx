import { Box, Typography, Card, CardContent, Divider } from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import { ButtonIcon, CopyData, ModalProps } from 'dex-ui';
import React from 'react';

import TransactionItem from '../components/crypto/TransactionItem';
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
        {/* More appropriate title */}
        <ButtonIcon
          iconName="close"
          color="secondary"
          size="sm"
          onClick={hideModal}
        />
      </Box>
      <Divider />

      {transactions.map((transaction) => (
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
