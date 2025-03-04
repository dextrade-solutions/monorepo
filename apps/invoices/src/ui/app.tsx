import { Box, Container, Typography } from '@mui/material';
import { useConnections } from 'dex-connect';
import { Invoice } from 'dex-ui';
import React from 'react';

import { config } from './web3-config';

export default function App() {
  const { connections } = useConnections({ wagmiConfig: config });

  const pathParts = window.location.pathname.split('/');
  const invoiceId = pathParts[pathParts.length - 1];

  const handleBackButtonClick = () => {
    // Navigate to the previous page
    window.history.back();
  };

  return (
    <Container maxWidth="sm">
      <Box paddingY={3}>
        {invoiceId ? (
          <Invoice
            id={invoiceId}
            connections={connections.data}
            onBack={window.history.length > 1 && handleBackButtonClick}
          />
        ) : (
          <>
            <Typography textAlign="center" variant="h3" fontWeight="bold">
              404
            </Typography>
            <Typography textAlign="center" variant="h6">
              Oops! Invoice Not Found
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
}
