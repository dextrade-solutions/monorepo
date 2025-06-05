import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { SECOND, shortenAddress } from 'dex-helpers';
import { InvoiceView } from 'dex-ui';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { PaybisConfig } from './paybis-api-client';
import { usePaybis } from './paybis-react-component';

interface Props {
  paybisConfig: PaybisConfig;
}

function getStatusConfig(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return {
        color: 'success' as const,
        icon: <CheckCircle size={18} />,
      };
    case 'pending':
      return {
        color: 'warning' as const,
        icon: <Clock size={18} />,
      };
    case 'failed':
      return {
        color: 'error' as const,
        icon: <AlertCircle size={18} />,
      };
    default:
      return {
        color: 'default' as const,
        icon: null,
      };
  }
}

function DepositPage({ paybisConfig }: Props) {
  const { requestId: tempId } = useParams();
  const paybis = usePaybis(paybisConfig);
  const actualRequestId =
    localStorage.getItem(`paybis_temp_${tempId}`) ||
    '149bee5b-5d16-449e-8efe-74476aacb322';

  const { data: paymentDetails, isLoading: isPaymentLoading } = useQuery({
    queryKey: ['paybis-payment-details', tempId],
    queryFn: async () => {
      const details = await paybis.getPaymentDetails(
        actualRequestId as 'buy' | 'sell',
      );
      return details;
    },
  });

  const { data: transactionDetails, isLoading: isTransactionLoading } =
    useQuery({
      queryKey: ['paybis-transaction-details', actualRequestId],
      queryFn: async () => {
        return await paybis.getTransactionByRequestId(actualRequestId);
      },
      refetchInterval: 5 * SECOND,
    });

  if (isPaymentLoading || isTransactionLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  const transaction = transactionDetails?.data?.[0];
  const statusConfig = transaction ? getStatusConfig(transaction.status) : null;

  // Convert Paybis data to InvoiceView format
  const invoiceData = paymentDetails?.data
    ? {
        id: paymentDetails.data.invoice,
        address: paymentDetails.data.depositAddress,
        amount_requested: paymentDetails.data.amount,
        amount_requested_f: paymentDetails.data.amount,
        amount_received_total:
          transaction?.amounts?.receivedOriginal?.amount || '0',
        amount_received_total_f:
          transaction?.amounts?.receivedOriginal?.amount || '0',
        // converted_amount_received_total_f: transaction?.amounts?.receivedOriginal?.amount || '0',
        // converted_amount_requested: paymentDetails.data.amount,
        // converted_amount_requested_f: paymentDetails.data.amount,
        status:
          transaction?.status === 'completed'
            ? 3
            : transaction?.status === 'payment_error'
              ? 2
              : 1,

        coin: { iso: paymentDetails.data.currencyCode },
        currency: {
          iso_with_network: paymentDetails.data.network,
          type: 1,
          iso: paymentDetails.data.currencyCode,
          native_currency_iso: paymentDetails.data.currencyCode,
          token_type: null,
          iso_with_network: '',
          network_name: paymentDetails.data.network,
          symbol: paymentDetails.data.currencyCode,
        },
        invoice_number: paymentDetails.data.invoice,
        due_to: null,
        discounts: null,
        tax: null,
        payment_page_url: '',
        logo_url: null,
      }
    : null;

  return (
    <Box p={3} maxWidth="lg" mx="auto">
      {invoiceData && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 3,
            bgcolor: 'primary.light',
          }}
        >
          <InvoiceView
            invoice={invoiceData}
            hideHeader
            showQrListItem
            showInvoiceUrlQr
          />
        </Paper>
      )}

      {transaction && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: 'primary.light',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Transaction Details
          </Typography>
          <Grid container spacing={3}>
            {transaction.from.address && (
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  gutterBottom
                >
                  From Address
                </Typography>
                {shortenAddress(transaction.from.address)}
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                gutterBottom
              >
                To Address
              </Typography>
              {transaction.to.address
                ? shortenAddress(transaction.to.address)
                : 'Not available'}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                gutterBottom
              >
                Amount Spent
              </Typography>
              <Typography variant="body1">
                {transaction.amounts.spentOriginal.amount}{' '}
                {transaction.amounts.spentOriginal.currency}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                gutterBottom
              >
                Amount Received
              </Typography>
              <Typography variant="body1">
                {transaction.amounts.receivedOriginal.amount}{' '}
                {transaction.amounts.receivedOriginal.currency}
              </Typography>
            </Grid>
            {transaction.fees.paybisFee && (
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  gutterBottom
                >
                  Paybis Fee
                </Typography>
                <Typography variant="body1">
                  {transaction.fees.paybisFee.amount}{' '}
                  {transaction.fees.paybisFee.currency}
                </Typography>
              </Grid>
            )}
            {transaction.fees.networkFee && (
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  gutterBottom
                >
                  Network Fee
                </Typography>
                <Typography variant="body1">
                  {transaction.fees.networkFee.amount}{' '}
                  {transaction.fees.networkFee.currency}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

export default DepositPage;
