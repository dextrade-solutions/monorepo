import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { useLocation } from 'wouter';

import { ROUTE_INVOICE_CREATE } from '../constants/pages';

const invoices = [
  { id: 1, amount: '1 USDT', date: '29/01/2025', status: 'Awaiting payment' },
  { id: 2, amount: '11 BTC', date: '29/01/2025', status: 'Paid' },
  { id: 3, amount: '11 BTC', date: '29/01/2025', status: 'Paid' },
];

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
          {invoices.map(({ id, amount, date, status }) => (
            <Card key={id} sx={{ borderRadius: 1 }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography fontWeight="bold">{amount}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {date}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="textSecondary">
                    {status}
                  </Typography>
                  <Box display="flex" gap={2}>
                    <Typography variant="body2" fontWeight="bold">
                      Edit
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Copy link
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Transactions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
