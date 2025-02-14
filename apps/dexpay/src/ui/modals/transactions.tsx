import {
  Box,
  Skeleton,
  Typography,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
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

      {currencies.isLoading && (
        <Card
          elevation={0}
          sx={{
            marginTop: 2,
            bgcolor: 'primary.light',
            borderRadius: 1,
          }}
        >
          <CardContent>
            <Box display="flex">
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                sx={{ mr: 2 }}
              />
              <Box>
                <Skeleton height={20} width={100} />
                <Skeleton height={16} width={80} sx={{ mt: 1 }} />
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Skeleton height={20} width="60%" />
            <Box mt={1}>
              <Skeleton height={16} width="100%" />
              <Skeleton height={16} width="80%" sx={{ mt: 1 }} />
              <Skeleton height={16} width="60%" sx={{ mt: 1 }} />
            </Box>
            <Divider sx={{ my: 1 }} />
            <Skeleton height={20} width="50%" />
            <Skeleton height={16} width="30%" sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      )}

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
