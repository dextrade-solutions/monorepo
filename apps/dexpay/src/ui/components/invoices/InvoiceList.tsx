import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Button,
  Chip,
  IconButton,
  Fab,
} from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import { CircleNumber, CopyData, useGlobalModalContext } from 'dex-ui';
import { DeleteIcon, Settings, Trash } from 'lucide-react';
import React from 'react';

import { useMutation, useQuery } from '../../hooks/use-query';
import { useUser } from '../../hooks/use-user';
import { Invoice } from '../../services';
import { IInvoice } from '../../types';

export default function InvoiceList() {
  const { user } = useUser();
  const { showModal } = useGlobalModalContext();
  const invoices = useQuery(Invoice.list, { projectId: user?.project.id });
  const deleteInvoice = useMutation(Invoice.delete, {
    onSuccess: () => {
      invoices.refetch();
    },
  });

  const renderInvoicesList = invoices.data?.currentPageResult || [];

  const handleRemove = (invoice: IInvoice) => {
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
      onConfirm: () => {
        if (!user?.project) {
          throw new Error('handleRemove - no user project selected');
        }
        return deleteInvoice.mutateAsync([
          { projectId: user.project.id, id: invoice.id },
        ]);
      },
    });
  };

  return (
    <>
      {renderInvoicesList.map((invoice, idx) => (
        <Card
          sx={{
            bgcolor: 'secondary.dark',
            borderRadius: 1,
          }}
          key={invoice.id}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="body2" color="textSecondary">
                {invoice.due_to}
              </Typography>
            </Box>
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
              <Typography className="flex-grow">Copy link</Typography>
              <CopyData
                className="flex-shrink"
                shorten
                data={invoice.payment_page_url}
              />
            </Box>
            <Box display="flex" alignItems="center">
              <Typography className="flex-grow"></Typography>
            </Box>
            <Chip
              icon={<Trash size={20} />}
              label="Remove"
              onClick={() => handleRemove(invoice)}
            />
            <Chip sx={{ ml: 1 }} icon={<Settings size={20} />} label="Config" />
            {idx === 0 && (
              <Chip
                sx={{ ml: 1 }}
                icon={<CircleNumber size={30} number={1} />}
                label={
                  <Box display="flex" alignItems="center">
                    Transactions
                  </Box>
                }
              />
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
