import { Card, CardContent, Typography, Button, Box, Paper } from '@mui/material';
import { useLocation } from 'wouter';

import InvoiceList from '../components/invoices/InvoiceList';
import { ROUTE_INVOICE_CREATE } from '../constants/pages';
import { Tag } from 'lucide-react';
import { Icon, UrlIcon } from 'dex-ui';

// const invoices = [
//   { id: 1, amount: '1 USDT', date: '29/01/2025', status: 'Awaiting payment' },
//   { id: 2, amount: '11 BTC', date: '29/01/2025', status: 'Paid' },
//   { id: 3, amount: '11 BTC', date: '29/01/2025', status: 'Paid' },
// ];

export default function Merchant() {
  const [, navigate] = useLocation();
  return (
    <Box sx={{ mx: 'auto' }}>
      <Box mb={4}>
        <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Total income
          </Typography>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            $4.00 USD
          </Typography>
        </Paper>

        <Button
          fullWidth
          onClick={() => {
            navigate(ROUTE_INVOICE_CREATE);
          }}
          color="secondary"
          size="large"
          variant="contained"
          startIcon={<Icon name="tag" />}
        >
          Create Invoice
        </Button>
      </Box>


      <Box>
        <Typography variant="h6" gutterBottom>
          Invoices
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <InvoiceList />
        </Box>
      </Box>
    </Box>
  );
}
