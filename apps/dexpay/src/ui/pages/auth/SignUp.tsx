import { Box, Container, Typography } from '@mui/material';
import { useForm } from 'dex-ui';
import React from 'react';

import OtpConfirm from '../../components/OtpConfirm';
import SignUpForm from '../../components/signup/SignUpForm';
import { useAuth } from '../../hooks/use-auth';
import { Validation } from '../../validation';

const SignUp = () => {
  const {
    twoFAdata: { codeToken },
    twoFA,
    signUp,
  } = useAuth();

  const form = useForm({
    values: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Validation.Auth.signUp,
    method: signUp,
  });
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
          <OtpConfirm
            email={form.values.email}
            method={(code) => twoFA({ code, isNewMode: false })}
          />
        ) : (
          <SignUpForm form={form} />
        )}
      </Box>
    </Container>
  );
};

export default SignUp;
