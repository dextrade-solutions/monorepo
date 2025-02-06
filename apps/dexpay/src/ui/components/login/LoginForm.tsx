import { Box, Button } from '@mui/material';
import { useGlobalModalContext, useForm } from 'dex-ui';
import React, { useState, useRef, ChangeEvent } from 'react';
import { useLocation } from 'wouter';

import { TextFieldWithValidation } from '../../components/fields';
import { ROUTE_HOME } from '../../constants/pages';
import { useMutation } from '../../hooks/use-query';
import { useUser } from '../../hooks/use-user';
import { Validation } from '../../validation';

const LoginForm = () => {
  const user = useUser();
  const form = useForm({ validationSchema: Validation.Auth.signIn });
  const [values, setValues] = useState({
    email: '',
    password: '',
  });
  const [, navigate] = useLocation();
  const { showModal } = useGlobalModalContext();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await user.login(values.email, values.password);
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
      <TextFieldWithValidation
        margin="normal"
        fullWidth
        label="Password"
        type="password"
        autoComplete="current-password"
        value={values.password}
        validationForm={form}
        name="password"
        onChange={handleInputChange}
      />
      <Button
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        color="primary"
        disabled={
          !form.isInitiated ||
          !form.isInteracted ||
          Boolean(form.primaryError)
        }
        sx={{ mt: 3, mb: 2 }}
      >
        {form.primaryError || 'Sign in'}
      </Button>
    </Box>
  );
};

export default LoginForm;
