import {
  Box,
  Alert,
  ListItemAvatar,
  ListItemText,
  MenuList,
  Typography,
  ListItem,
  ButtonGroup,
  Paper,
} from '@mui/material';
import { getQRuriPayment, shortenAddress } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { useState } from 'react';

import { PAYMENT_QR_SUPPORTED } from './constants';
import { Button, QRCode, UrlIcon } from '../../ui';
import { IInvoice } from './types/entities';

export default function InvoiceQr({
  amount,
  invoice,
  asset,
}: {
  amount: string | number;
  asset: AssetModel;
  invoice: IInvoice;
}) {
  const [showPaymentQr, setShowPaymentQr] = useState(false);

  const paymentQrWallets = asset ? PAYMENT_QR_SUPPORTED[asset.iso] || [] : [];

  const paymentQrAvailable = paymentQrWallets.length > 0;

  const PAYMENT_QR_PARAMS = {
    hideDownloadQr: true,
    gradientProps: {
      type: 'linear',
      rotation: 45,
      colorStops: [
        { offset: 0, color: '#00C283' },
        { offset: 0.4, color: '#3b82f6' },
      ],
    },
    description: (
      <Box>
        <Typography textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Recipient
          </Typography>
          {shortenAddress(invoice.address)}
        </Typography>
        <Paper elevation={0} sx={{ bgcolor: 'secondary.dark', my: 2 }}>
          <MenuList>
            <Typography p={1} variant="body2" fontWeight="bold">
              Supported apps
            </Typography>
            {paymentQrWallets.map((wallet) => (
              <ListItem key={wallet.name}>
                <ListItemAvatar>
                  <UrlIcon size={40} url={wallet.icon} />
                </ListItemAvatar>
                <ListItemText primary={wallet.displayName} />
              </ListItem>
            ))}
          </MenuList>
        </Paper>

        <Alert severity="warning">
          Do not scan it in other apps, or you may lose your funds permanently.
        </Alert>
      </Box>
    ),
    value: getQRuriPayment(
      invoice.address,
      amount,
      invoice.currency.network_name,
      asset.contract,
      asset.decimals,
    ),
  };

  const ADDRESS_QR = {
    hideDownloadQr: true,
    showQrValue: true,
    description: (
      <Box textAlign="center">
        <Typography color="text.secondary">Amount</Typography>
        <Typography variant="h4">
          <strong>
            {amount} {asset.symbol}
          </strong>
        </Typography>
        <Typography color="text.secondary">Recipient</Typography>
      </Box>
    ),
    value: invoice.address,
  };

  return (
    <Box>
      <Box width="100%" display="flex" justifyContent="center" my={2}>
        <ButtonGroup
          disableElevation
          variant="contained"
          aria-label="Disabled button group"
        >
          <Button
            variant={!showPaymentQr ? 'contained' : 'outlined'}
            onClick={() => setShowPaymentQr(false)}
            sx={{ ml: 2 }}
          >
            Address QR
          </Button>
          {paymentQrAvailable && (
            <Button
              variant={showPaymentQr ? 'contained' : 'outlined'}
              onClick={() => setShowPaymentQr(true)}
            >
              Payment QR
            </Button>
          )}
        </ButtonGroup>
      </Box>

      {showPaymentQr ? (
        <QRCode {...PAYMENT_QR_PARAMS} />
      ) : (
        <QRCode {...ADDRESS_QR} />
      )}
    </Box>
  );
}
