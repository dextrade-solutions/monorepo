import { Box, Container, Typography } from '@mui/material';
import React from 'react';

import LoginForm from '../../components/login/LoginForm';
import LoginOtp from '../../components/login/LoginOtp';
import { useUser } from '../../hooks/use-user';

const Login = () => {
  const {
    twoFAdata: { codeToken },
  } = useUser();

  return (
    <Container maxWidth="xs">
      {' '}
      {/* Center the content */}
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // Center horizontally
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Dex<strong>Pay</strong> {/* Add DexPay title */}
        </Typography>
        {codeToken ? <LoginOtp /> : <LoginForm />} {/* Conditional rendering */}
      </Box>
    </Container>
  );
};

export default Login;
