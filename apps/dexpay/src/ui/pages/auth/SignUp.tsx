import { Box, Container, Typography } from '@mui/material';
import React from 'react';

import OtpConfirm from '../../components/OtpConfirm';
import SignUpForm from '../../components/signup/SignUpForm';
import { useAuth } from '../../hooks/use-auth';

const SignUp = () => {
  const {
    twoFAdata: { codeToken },
    twoFA,
  } = useAuth();
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
        {codeToken ? (
          <OtpConfirm method={(code) => twoFA({ code, isNewMode: false })} />
        ) : (
          <SignUpForm />
        )}
      </Box>
    </Container>
  );
};

export default SignUp;
