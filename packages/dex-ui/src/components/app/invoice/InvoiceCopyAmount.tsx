import { Alert, Box, Button, Divider, Grid, Typography } from '@mui/material';
import { shortenAddress } from 'dex-helpers';
import React from 'react';

import { IInvoiceFull } from './types/entities';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { CopyData, QRCode } from '../../ui';

export const InvoiceCopyAmount = ({
  showInvoiceUrlQr,
  invoice,
  amount,
}: {
  showInvoiceUrlQr?: boolean;
  invoice: IInvoiceFull;
  amount: string;
}) => {
  const [copiedAddress, handleCopyAddress] = useCopyToClipboard();
  const [copiedAmount, handleCopyAmount] = useCopyToClipboard();
  const paymentLink = invoice.payment_page_url;
  return (
    <Box margin={3}>
      <Box display="flex">
        <Typography textAlign="left" className="flex-grow nowrap">
          Network
        </Typography>
        <Typography fontWeight="bold">
          {invoice.currency.network_name}
        </Typography>
      </Box>
      <Box my={2}>
        <Divider />
      </Box>
      <Box display="flex" textAlign="right" alignItems="center">
        <Typography textAlign="left" className="flex-grow nowrap">
          Address
        </Typography>
        <CopyData data={invoice.address} />
      </Box>
      {showInvoiceUrlQr && paymentLink && (
        <>
          <Box>
            <QRCode value={paymentLink} hideDownloadQr />
          </Box>
          <Alert sx={{ mt: 2 }} severity="info">
            Scan qr to open invoice on your device
          </Alert>
        </>
      )}
      <Grid container spacing={1} my={2}>
        <Grid item xs={6}>
          <Button
            sx={{ height: '100%', width: '100%' }}
            variant="contained"
            onClick={() => handleCopyAddress(invoice.address)}
          >
            {copiedAddress
              ? 'Copied!'
              : `Copy address ${shortenAddress(invoice.address)}`}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            sx={{ height: '100%', width: '100%' }}
            variant="contained"
            onClick={() => handleCopyAmount(amount)}
          >
            {copiedAmount
              ? 'Copied!'
              : `Copy amount ${amount} ${invoice.coin?.iso}`}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
