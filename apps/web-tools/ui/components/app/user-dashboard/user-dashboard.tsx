import { useOkto, getAccount, getPortfolio } from '@okto_web3/react-sdk';
import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export function UserDashboard() {
  const oktoClient = useOkto();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true);
        // Get user's accounts/wallets
        const userAccounts = await getAccount(oktoClient);
        setAccounts(userAccounts);

        // Get user's portfolio
        const userPortfolio = await getPortfolio(oktoClient);
        setPortfolio(userPortfolio);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (oktoClient.userSWA) {
      fetchUserData();
    }
  }, [oktoClient]);

  if (isLoading) {
    return (
      <Box p={2}>
        <Typography>Loading user data...</Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Welcome {oktoClient.userSWA}
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Accounts
          </Typography>
          {accounts.map((account) => (
            <Box key={account.caipId} mb={1}>
              <Typography variant="subtitle1">
                Network: {account.networkName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address: {account.address}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Portfolio
          </Typography>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(portfolio, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </Box>
  );
} 