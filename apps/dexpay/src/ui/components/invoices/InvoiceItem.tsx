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
  useLoader,
} from 'dex-ui';
import { map } from 'lodash';
import { DeleteIcon, LucideArrowUpRight, Settings, Trash } from 'lucide-react';
import React from 'react';
import { useLocation } from 'wouter';

import { ROUTE_INVOICE_EDIT } from '../../constants/pages';
import { useAuth } from '../../hooks/use-auth';
import { useMutation } from '../../hooks/use-query';
import { Invoice } from '../../services';
import { IInvoice } from '../../types';

interface InvoiceItemProps {
  invoice: IInvoice;
  onEdit?: () => void;
  onDelete?: (id: number) => void;
}

export const InvoiceItem: React.FC<InvoiceItemProps> = ({
  invoice,
  onDelete,
}) => {
  const {
    id,
    description,
    due_to: dueDate,
    amount_requested: amount,
    status_label: status,
  } = invoice;
  const { user } = useAuth();
  const loader = useLoader();
  const { showModal } = useGlobalModalContext();
  const [_, navigate] = useLocation();

  const handleEdit = () => {
    navigate(`${ROUTE_INVOICE_EDIT}/${id}`);
  };

  const expirationTime = invoice.due_to
    ? new Date(invoice.due_to).getTime() - new Date().getTime()
    : null;

  const deleteInvoice = useMutation(Invoice.delete, {
    onSuccess: () => {
      onDelete && onDelete(invoice.id);
    },
  });

  const handleRemove = () => {
    showModal({
      name: 'CONFIRM_MODAL',
      title: (
        <Box display="flex" alignItems="center">
          <DeleteIcon size={40} />
          <Typography variant="h5" ml={2}>
            Remove invoice?
          </Typography>
        </Box>
      ),
      onConfirm: async () => {
        if (!user?.project) {
          throw new Error('handleRemove - no user project selected');
        }
        loader.runLoader(
          deleteInvoice.mutateAsync([
            { projectId: user.project.id, id: invoice.id },
          ]),
        );
      },
    });
  };

  const STATUS_COLOR = {
    2: 'error.dark', // error
    3: 'success.dark', // success'
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
    >
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6" fontWeight="bold">
          {invoice.converted_coin
            ? formatCurrency(
                invoice.converted_amount_requested,
                invoice.converted_coin?.iso,
              )
            : formatCurrency(invoice.amount_requested, invoice.currency.iso)}
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
                  color="success.main"
                  size={25}
                  number={invoice.transactions.length}
                />
              }
              size="small"
              rounded
              fullWidth
              color="success"
              onClick={() =>
                showModal({
                  name: 'DEXPAY_TRANSACTIONS_LIST',
                  transactions: map(invoice.transactions, 'transaction'),
                })
              }
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
          onClick={() => {
            window.open(invoice.payment_page_url, '_blank');
          }}
          endIcon={<LucideArrowUpRight size={20} />}
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
      {expirationTime && (
        <Box display="flex" alignItems="center" mb={1}>
          <Typography className="flex-grow">Expiration</Typography>
          <Typography>
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
      <Box mb={2} />
      <Box display="flex" gap={2}>
        <Button
          sx={{ ml: 1 }}
          size="small"
          rounded
          fullWidth
          variant="contained"
          color="tertiary"
          startIcon={<Settings size={20} />}
          onClick={handleRemove}
        >
          Config
        </Button>
        <Button
          sx={{ ml: 1 }}
          size="small"
          fullWidth
          rounded
          variant="outlined"
          color="tertiary"
          startIcon={<Trash size={20} />}
          onClick={handleRemove}
        >
          Remove
        </Button>
      </Box>
    </Paper>
  );
};
