import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { useLocation } from 'wouter';

import InvoiceList from '../components/invoices/InvoiceList';
import { ROUTE_INVOICE_CREATE } from '../constants/pages';

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
        <Card>
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              Total income
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              $4.00 USD
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                navigate(ROUTE_INVOICE_CREATE);
              }}
            >
              Create Invoice
            </Button>
          </CardContent>
        </Card>
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
