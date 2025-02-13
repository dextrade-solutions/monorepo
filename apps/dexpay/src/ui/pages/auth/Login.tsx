import { Box, Container, Typography } from '@mui/material';
import React from 'react';

import LoginForm from '../../components/login/LoginForm';
import OtpConfirm from '../../components/OtpConfirm';
import { useAuth } from '../../hooks/use-auth';

const Login = () => {
  const {
    twoFAdata: { codeToken },
    twoFA,
  } = useAuth();

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
          alignItems: 'center',
        }}
      >
        {codeToken ? <OtpConfirm method={twoFA} /> : <LoginForm />}
      </Box>
    </Container>
  );
};

export default Login;
