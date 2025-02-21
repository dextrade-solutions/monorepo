import { Box, Typography } from '@mui/material';
import { useForm, Button } from 'dex-ui';
import React from 'react';

import { ROUTE_REGISTER, ROUTE_FORGOT_PASSWORD } from '../../constants/pages';
import { useAuth } from '../../hooks/use-auth';
import { Validation } from '../../validation';
import { TextFieldWithValidation, VPasswordField } from '../fields';
import Link from '../ui/Link';

const LoginForm = () => {
  const auth = useAuth();
  const form = useForm({
    values: {
      email: '',
      password: '',
    },
    validationSchema: Validation.Auth.signIn,
    method: (values) => auth.login(values.email, values.password),
  });

  return (
    <Box
      data-testid="login-form"
      component="form"
      textAlign="right"
      onSubmit={form.submit}
      noValidate
    >
      <TextFieldWithValidation
        data-testid="login-email-input"
        margin="normal"
        fullWidth
        label="Email Address"
        autoComplete="email"
        autoFocus
        form={form}
        name="email"
        onChange={(e) => e.target.value}
      />
      <VPasswordField
        data-testid="login-password-input"
        margin="normal"
        fullWidth
        label="Password"
        autoComplete="current-password"
        name="password"
        form={form}
        onChange={(e) => e.target.value}
      />
      <Link href={ROUTE_FORGOT_PASSWORD} noUnderline>
        Forgot password?
      </Link>

      <Button
        data-testid="login-submit-button"
        type="submit"
        fullWidth
        gradient
        size="large"
        sx={{ mt: 3, mb: 2 }}
      >
        Sign in
      </Button>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
      >
        <Typography mr={1} color="text.secondary">
          Don’t have an account?
        </Typography>
        <Link href={ROUTE_REGISTER} data-testid="login-signup-link">
          Sign Up
        </Link>
      </Box>
    </Box>
  );
};

export default LoginForm;
