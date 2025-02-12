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
      <Box color="text.tertiary">
        <Typography variant="h4" component="h1" gutterBottom fontWeight="550">
          Welcome back, to Dex<strong>Pay</strong>!
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // Center horizontally
        }}
      >
        {codeToken ? <LoginOtp /> : <LoginForm />} {/* Conditional rendering */}
      </Box>
    </Container>
  );
};

export default Login;
