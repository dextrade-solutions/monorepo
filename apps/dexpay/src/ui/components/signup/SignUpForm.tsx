import { Box, Button, Typography } from '@mui/material';
import { useForm, useLoader, useGlobalModalContext } from 'dex-ui';
import React, { useState, ChangeEvent } from 'react';

import { ROUTE_LOGIN } from '../../constants/pages';
import { useAuth } from '../../hooks/use-auth';
import { Validation } from '../../validation';
import { TextFieldWithValidation, VPasswordField } from '../fields';
import Link from '../ui/Link';

const SignUpForm = () => {
  const user = useAuth();
  const [values, setValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const form = useForm({ validationSchema: Validation.Auth.signUp, values });
  const loader = useLoader();
  const { showModal } = useGlobalModalContext();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await loader.runLoader(
        user.signUp({
          email: values.email,
          password: values.password,
        }),
      );
    } catch (error: any) {
      showModal({
        name: 'ALERT_MODAL',
        severity: 'error',
        text: error.message,
        autoClose: 5000,
      });
      console.error('Error signing up:', error);
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
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ mt: 1 }}
      data-testid="signup-form"
    >
      <TextFieldWithValidation
        margin="normal"
        fullWidth
        label="Email Address"
        autoComplete="email"
        autoFocus
        validationForm={form}
        value={values.email}
        name="email"
        data-testid="signup-email-input"
        onChange={handleInputChange}
      />
      <VPasswordField
        margin="normal"
        fullWidth
        label="Password"
        type="password"
        autoComplete="new-password"
        value={values.password}
        name="password"
        validationForm={form}
        data-testid="signup-password-input"
        onChange={handleInputChange}
      />
      <VPasswordField
        margin="normal"
        fullWidth
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        name="confirmPassword"
        validationForm={form}
        data-testid="signup-confirm-password-input"
        onChange={handleInputChange}
      />
      <Button
        data-testid="signup-submit-button"
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        color="primary"
        disabled={
          !form.isInitiated || !form.isInteracted || Boolean(form.primaryError)
        }
        sx={{ mt: 3, mb: 2 }}
      >
        {form.primaryError || 'Sign up'}
      </Button>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
      >
        <Typography mr={1} color="text.secondary">
          Already have an account?
        </Typography>
        <Link
          href={ROUTE_LOGIN}
          color="text.tertiary"
          data-testid="signup-signin-link"
        >
          Sign in
        </Link>
      </Box>
    </Box>
  );
};

export default SignUpForm;
