import { Box, Container, Typography } from '@mui/material';
import React from 'react';

import LoginOtp from '../../components/login/LoginOtp';
import SignUpForm from '../../components/signup/SignUpForm';
import { useUser } from '../../hooks/use-user';

const SignUp = () => {
  const {
    twoFAdata: { codeToken },
  } = useUser();
  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          color="text.tertiary"
          gutterBottom
        >
          Dex<strong>Pay</strong>
        </Typography>
        {codeToken ? <LoginOtp old /> : <SignUpForm />}
      </Box>
    </Container>
  );
};

export default SignUp;
