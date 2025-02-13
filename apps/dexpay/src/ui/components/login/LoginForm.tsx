import { Box, Typography } from '@mui/material';
import {
  useGlobalModalContext,
  useForm,
  useLoader,
  GradientButton,
} from 'dex-ui';
import React, { useState, ChangeEvent } from 'react';

import { ROUTE_REGISTER, ROUTE_FORGOT_PASSWORD } from '../../constants/pages';
import { useAuth } from '../../hooks/use-auth';
import { Validation } from '../../validation';
import { TextFieldWithValidation, VPasswordField } from '../fields';
import Link from '../ui/Link';

const LoginForm = () => {
  const auth = useAuth();
  const { showModal } = useGlobalModalContext();
  const form = useForm({ validationSchema: Validation.Auth.signIn });
  const [values, setValues] = useState({
    email: '',
    password: '',
  });
  const loader = useLoader();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await loader.runLoader(auth.login(values.email, values.password));
    } catch (error) {
      showModal({
        name: 'ALERT_MODAL',
        severity: 'error',
        text: error.message,
      });
    }
  };

  const handleInputChange = (
    name: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setValues((prev) => ({ ...prev, [name]: e.target.value }));
  };

  return (
    <Box
      data-testid="login-form"
      component="form"
      textAlign="right"
      onSubmit={handleSubmit}
      noValidate
    >
      <TextFieldWithValidation
        data-testid="login-email-input"
        margin="normal"
        fullWidth
        label="Email Address"
        autoComplete="email"
        autoFocus
        validationForm={form}
        value={values.email}
        name="email"
        onChange={handleInputChange}
      />
      <VPasswordField
        data-testid="login-password-input"
        margin="normal"
        fullWidth
        label="Password"
        autoComplete="current-password"
        value={values.password}
        name="password"
        validationForm={form}
        onChange={handleInputChange}
      />
      <Link href={ROUTE_FORGOT_PASSWORD} noUnderline>
        Forgot password?
      </Link>

      <GradientButton
        data-testid="login-submit-button"
        type="submit"
        fullWidth
        size="large"
        sx={{ mt: 3, mb: 2 }}
      >
        Sign in
      </GradientButton>

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
