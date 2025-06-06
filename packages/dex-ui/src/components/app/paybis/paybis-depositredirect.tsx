import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getIsoCoin, SECOND, shortenAddress } from 'dex-helpers';
import { InvoiceView } from 'dex-ui';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { networkMap } from './networks-map';
import { PaybisConfig } from './paybis-api-client';
import { usePaybis } from './paybis-react-component';
// import { useWallets } from '../../../../hooks/asset/useWallets';

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
  const connections = useWallets();
  const { requestId: tempId } = useParams();
  const paybis = usePaybis(paybisConfig);
  const actualRequestId =
    localStorage.getItem(`paybis_temp_${tempId}`) ||
    '1764626d-e52f-4cda-89aa-64c515230ca4';

  if (!actualRequestId) {
    return (
      <Box p={3} maxWidth="lg" mx="auto">
        <Alert severity="error">
          Transaction not found. The request ID is invalid or has expired.
        </Alert>
      </Box>
    );
  }

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

  const network = networkMap[paymentDetails.data.blockchain].config;

  // Convert Paybis data to InvoiceView format
  const invoiceData = paymentDetails?.data
    ? {
        id: paymentDetails.data.invoice,
        address: paymentDetails.data.depositAddress,
        amount_requested: paymentDetails.data.amount,
        amount_requested_f: paymentDetails.data.amount,
        amount_received_total_f: '0',
        converted_amount_requested: paymentDetails.data.amount || '0',
        converted_amount_requested_f: paymentDetails.data.amount || '0',
        status:
          transaction?.status === 'completed'
            ? 3
            : transaction?.status === 'payment_error'
              ? 2
              : 1,
        coin: { iso: paymentDetails.data.currencyCode },
        currency: {
          type: 1,
          iso: paymentDetails.data.currencyCode,
          native_currency_iso: paymentDetails.data.currencyCode,
          token_type: null,
          iso_with_network: getIsoCoin({
            networkName: network.key,
            ticker: paymentDetails.data.currencyCode,
          }),
          network_name: paymentDetails.data.network,
          symbol: paymentDetails.data.currencyCode,
        },
        invoice_number: paymentDetails.data.invoice,
        due_to: null,
        discounts: null,
        tax: null,
        payment_page_url: '',
        logo_url: null,
        discounts_f: null,
        converted_discounts_f: null,
        tax_f: null,
        converted_tax_f: null,
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
            connections={connections}
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
            {transaction.status && (
              <Grid item sx={{ textTransform: 'capitalize' }} xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  gutterBottom
                >
                  Status
                </Typography>
                {transaction.status}
              </Grid>
            )}
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
              {paymentDetails.data.depositAddress
                ? shortenAddress(paymentDetails.data.depositAddress)
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
                Amount Get
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
