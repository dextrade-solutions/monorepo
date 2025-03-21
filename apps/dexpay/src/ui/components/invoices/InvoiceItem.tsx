import {
  Box,
  Typography,
  Divider,
  CardContent,
  Card,
  Alert,
  Chip,
  Paper,
} from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import {
  CircleNumber,
  CopyData,
  CountdownTimer,
  Button,
  useGlobalModalContext,
} from 'dex-ui';
import { map } from 'lodash';
import { Eye, LucideArrowUpRight } from 'lucide-react';
import React from 'react';
import { useHashLocation } from 'wouter/use-hash-location';

import { ROUTE_INVOICE_DETAIL } from '../../constants/pages';
import { useAuth } from '../../hooks/use-auth';
import { IInvoice } from '../../types';

interface InvoiceItemProps {
  invoice: IInvoice;
  onEdit?: () => void;
  onDelete?: (id: number) => void;
}

export const InvoiceItem: React.FC<InvoiceItemProps> = ({ invoice }) => {
  const { me } = useAuth();
  const { showModal } = useGlobalModalContext();
  const [, navigate] = useHashLocation();

  const expirationTime = invoice.due_to
    ? new Date(invoice.due_to).getTime() - new Date().getTime()
    : null;

  const STATUS_COLOR = {
    2: 'error.dark', // error
    3: 'success.main', // success'
  };

  return (
    <Paper
      elevation={0}
      sx={{
        color: 'text.tertiary',
        bgcolor: 'primary.light',
        borderRadius: 1,
        p: 2,
      }}
      onClick={() =>
        navigate(
          `${ROUTE_INVOICE_DETAIL.replace(':id', `${invoice.public_id}:${invoice.id}`)}`,
        )
      }
    >
      <Box display="flex" justifyContent="space-between">
        <Typography ml={1} variant="h6" fontWeight="bold">
          {invoice.converted_coin
            ? formatCurrency(
                invoice.converted_amount_requested,
                invoice.converted_coin?.iso,
              )
            : formatCurrency(
                invoice.amount_requested,
                invoice.currency?.iso || '',
              )}
        </Typography>
        <Box textAlign="right">
          <Typography
            color={STATUS_COLOR[invoice.status] || 'textSecondary'}
            variant="body2"
          >
            {invoice.status_label}
          </Typography>
          {invoice.transactions.length > 0 && (
            <Button
              sx={{ ml: 1 }}
              startIcon={
                <CircleNumber
                  color="success.light"
                  textColor="success.main"
                  size={25}
                  number={invoice.transactions.length}
                />
              }
              size="small"
              rounded
              fullWidth
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                showModal({
                  name: 'DEXPAY_TRANSACTIONS_LIST',
                  transactions: map(invoice.transactions, 'transaction'),
                });
              }}
            >
              Transactions
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Button
          size="small"
          color="tertiary"
          endIcon={<LucideArrowUpRight size={20} />}
          onClick={() => {
            window.open(invoice.payment_page_url, '_blank');
          }}
        >
          Open link
        </Button>
        <div className="flex-grow" />
        <CopyData
          className="flex-shrink"
          color="tertiary"
          shorten
          data={invoice.payment_page_url}
        />
      </Box>
      {invoice.creator && me?.id !== invoice.creator?.id && (
        <Box
          display="flex"
          mx={0.5}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="body2">Salesperson</Typography>
          <div className="flex-grow" />
          <Typography variant="body2">{invoice.creator?.email}</Typography>
        </Box>
      )}
      {expirationTime && expirationTime > 0 && (
        <Box display="flex" mx={0.5} alignItems="center" mb={1}>
          <Typography variant="body2" className="flex-grow">
            Expiration
          </Typography>
          <Typography variant="body2">
            <CountdownTimer
              timeStarted={new Date().getTime()}
              timerBase={expirationTime}
              timeOnly
            />
          </Typography>
        </Box>
      )}
      {invoice.description && (
        <Box display="flex" alignItems="center" mb={1}>
          <Alert severity="info">{invoice.description}</Alert>
        </Box>
      )}
    </Paper>
  );
};
