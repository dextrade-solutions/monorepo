import {
  Box,
  Typography,
  Divider,
  Chip,
  CardContent,
  Card,
  Alert,
} from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import {
  CircleNumber,
  CopyData,
  CountdownTimer,
  useGlobalModalContext,
  useLoader,
} from 'dex-ui';
import { DeleteIcon, Settings, Trash } from 'lucide-react';
import React from 'react';
import { useLocation } from 'wouter';
import { map } from 'lodash';

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

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: 'primary.light',
        borderRadius: 1,
      }}
      key={invoice.id}
    >
      <CardContent>
        {invoice.converted_coin?.iso && (
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              {formatCurrency(
                invoice.converted_amount_requested,
                invoice.converted_coin?.iso,
              )}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {invoice.status_label}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />
        <Box display="flex" alignItems="center">
          <Typography className="flex-grow">Link</Typography>
          <CopyData
            className="flex-shrink"
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
        <Chip
          icon={<Trash size={20} />}
          label="Remove"
          onClick={handleRemove}
        />
        <Chip sx={{ ml: 1 }} icon={<Settings size={20} />} label="Config" />
        {invoice.transactions.length > 0 && (
          <Chip
            sx={{ ml: 1 }}
            icon={
              <CircleNumber size={30} number={invoice.transactions.length} />
            }
            label={
              <Box display="flex" alignItems="center">
                Transactions
              </Box>
            }
            onClick={() =>
              showModal({
                name: 'DEXPAY_TRANSACTIONS_LIST',
                transactions: map(invoice.transactions, 'transaction'),
              })
            }
          />
        )}
      </CardContent>
    </Card>
  );
};
