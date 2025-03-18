import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import { shortenAddress, getCoinIconByUid, SECOND } from 'dex-helpers';
import {
  Icon,
  useGlobalModalContext,
  useLoader,
  UrlIcon,
  InvoiceView,
} from 'dex-ui';
import { DeleteIcon, Trash } from 'lucide-react';
import React, { useEffect } from 'react';
import { useParams } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';

import { ROUTE_MERCHANT } from '../constants/pages';
import { useAuth } from '../hooks/use-auth';
import { useCurrencies } from '../hooks/use-currencies';
import { useMutation, useQuery } from '../hooks/use-query';
import { Invoice } from '../services';

interface InvoiceDetailPageParams {
  id: string;
}

export default function InvoiceDetailPage() {
  const { id } = useParams<InvoiceDetailPageParams>();
  const loader = useLoader();
  const { showModal } = useGlobalModalContext();
  const [, navigate] = useHashLocation();
  const currencies = useCurrencies();
  const { user } = useAuth();
  const { isLoading, data: invoice } = useQuery(
    Invoice.paymentGet,
    {
      id,
      projectId: user?.project?.id,
    },
    {
      refetchInterval: 6 * SECOND,
    },
  );

  const deleteInvoice = useMutation(Invoice.delete, {
    onSuccess: () => {
      navigate(ROUTE_MERCHANT);
    },
  });

  useEffect(() => {
    if (!invoice && !isLoading) {
      navigate(ROUTE_MERCHANT);
    }
  }, [invoice, isLoading, navigate]);

  if (isLoading || !invoice) {
    return (
      <Box>
        <Skeleton width="100%" height={200} />
        <Box mt={2}>
          <Skeleton variant="text" width="50%" height={30} />
          <Skeleton variant="text" width="80%" height={20} />
          <Skeleton variant="text" width="60%" height={20} />
        </Box>
        <Box mt={4}>
          <Skeleton width="100%" height={50} />
        </Box>
        <Box mt={2}>
          <Skeleton width="100%" height={100} />
        </Box>
      </Box>
    );
  }

  const invoiceCurrncies = (invoice.supported_currencies || []).flatMap(
    (i) => i.iso_with_network,
  );

  const supportedCurrencies = currencies.items.filter((i) =>
    invoiceCurrncies.includes(i.currency.name),
  );

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

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'success.main';
      case 'pending':
        return 'warning.main';
      case 'expired':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Box data-testid="invoice-detail-page">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          data-testid="invoice-detail-title"
        >
          Invoice #{shortenAddress(id)}
        </Typography>
        <Button
          startIcon={<Icon name="arrow-left" />}
          onClick={() => navigate(ROUTE_MERCHANT)}
          data-testid="invoice-detail-back-button"
        >
          Back
        </Button>
      </Box>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <InvoiceView invoice={invoice} hideHeader />
        {supportedCurrencies.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="subtitle1" color="text.secondary" mb={2}>
                Supported Currencies
              </Typography>
              <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
                {supportedCurrencies.map(({ asset: item }) => (
                  <Chip
                    key={item.id}
                    label={
                      <Box display="flex">
                        <Typography>{item.symbol}</Typography>
                        {item.standard && (
                          <Typography ml={1} color="text.secondary">
                            {item.standard.toLowerCase()}
                          </Typography>
                        )}
                      </Box>
                    }
                    variant="outlined"
                    icon={<UrlIcon url={getCoinIconByUid(item.uid)} />}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}
        <Divider sx={{ my: 3 }} />
        <Box>
          <Button
            sx={{ ml: 1 }}
            fullWidth
            rounded
            color="tertiary"
            startIcon={<Trash size={20} />}
            onClick={handleRemove}
          >
            Remove
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
