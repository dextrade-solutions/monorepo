import { Box, Button, Typography } from '@mui/material';
import { useGlobalModalContext, useForm, useLoader } from 'dex-ui';
import React, { useState, ChangeEvent } from 'react';
import { Link } from 'wouter'; // Import Link

import { ROUTE_REGISTER, ROUTE_FORGOT_PASSWORD } from '../../constants/pages';
import { useUser } from '../../hooks/use-user';
import { Validation } from '../../validation';
import { TextFieldWithValidation, VPasswordField } from '../fields';

const LoginForm = () => {
  const user = useUser();
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
      await loader.runLoader(user.login(values.email, values.password));
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
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <TextFieldWithValidation
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
        margin="normal"
        fullWidth
        label="Password"
        autoComplete="current-password"
        value={values.password}
        name="password"
        validationForm={form}
        onChange={handleInputChange}
      />
      <Link href={ROUTE_FORGOT_PASSWORD}>
        <Typography>Forgot your password?</Typography>
      </Link>

      <Button
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
        {form.primaryError || 'Sign in'}
      </Button>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
      >
        <Typography mr={1}>Don’t have an account?</Typography>
        <Link href={ROUTE_REGISTER}>Sign Up</Link>
      </Box>
    </Box>
  );
};

export default LoginForm;
