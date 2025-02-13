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
  Skeleton,
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

import { useMutation, useQuery } from '../../hooks/use-query';
import { useAuth } from '../../hooks/use-auth';
import { Invoice } from '../../services';
import { IInvoice } from '../../types';

export default function InvoiceList() {
  const { user } = useAuth();
  const { showModal } = useGlobalModalContext();
  const loader = useLoader();
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

  if (invoices.isLoading) {
    return (
      <Card
        elevation={0}
        sx={{ bgcolor: 'secondary.dark', borderRadius: 1, mb: 2 }}
      >
        <CardContent>
          <Skeleton height={20} width="60%" />
          <Skeleton height={40} width="100%" sx={{ mt: 1 }} />
          <Divider sx={{ my: 1 }} />
          <Skeleton height={20} width="100%" />
          <Skeleton height={20} width="100%" sx={{ mt: 1 }} />
          <Box display="flex" alignItems="center" mt={1}>
            <Skeleton height={36} width={80} />
            <Skeleton height={36} width={80} sx={{ ml: 1 }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!renderInvoicesList.length) {
    return (
      <Typography color="text.secondary">
        No invoices created yet. Create a new one.
      </Typography>
    );
  }

  return (
    <>
      {renderInvoicesList.map((invoice, idx) => (
        <Card
          elevation={0}
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
              {/* {invoice.due_to && (
                <Typography variant="body2" color="textSecondary">
                  Due to:{' '}
                  {
                    <CountdownTimer
                      timeStarted={new Date().getTime()}
                      timerBase={
                        new Date().getTime() -
                        new Date(invoice.due_to).getTime()
                      }
                    />
                  }
                </Typography>
              )} */}
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
