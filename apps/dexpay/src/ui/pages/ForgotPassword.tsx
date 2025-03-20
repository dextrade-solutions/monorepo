// /Users/rkomarov/projects/dextrade/monorepo/apps/dexpay/src/ui/pages/auth/ForgotPassword.tsx
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { useForm } from 'dex-ui';
import React from 'react';
import { useHashLocation } from 'wouter/use-hash-location';

import { TextFieldWithValidation, VPasswordField } from '../components/fields';
import OtpConfirm from '../components/OtpConfirm';
import Link from '../components/ui/Link';
import { ROUTE_LOGIN } from '../constants/pages';
import { useAuth } from '../hooks/use-auth';
import { useMutation } from '../hooks/use-query';
import { Auth } from '../services';
import { Validation } from '../validation';

interface ForgotPasswordFormValues {
  email: string;
  new_password: string;
}

const ForgotPassword = () => {
  const { authenticate } = useAuth();
  const resetPasswordComplete = useMutation(Auth.resetPasswordComplete);
  const resetPasswordRequest = useMutation(Auth.resetPasswordRequest);

  const form = useForm<ForgotPasswordFormValues>({
    values: {
      email: '',
      new_password: '',
    },
    validationSchema: Validation.Auth.forgotPassword,
    method: resetPasswordRequest.mutateAsync,
  });

  const renderForm = () => (
    <Box
      width="100%"
      component="form"
      onSubmit={form.submit}
      noValidate
      sx={{ mt: 1 }}
    >
      <TextFieldWithValidation
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        form={form}
        onChange={(e) => e.target.value}
      />
      <VPasswordField
        margin="normal"
        fullWidth
        label="Password"
        type="password"
        autoComplete="new_password"
        name="new_password"
        form={form}
        data-testid="signup-password-input"
        onChange={(e) => e.target.value}
      />
      <VPasswordField
        margin="normal"
        fullWidth
        label="Confirm Password"
        type="password"
        autoComplete="confirm_password"
        name="confirm_password"
        form={form}
        data-testid="signup-confirm-password-input"
        onChange={(e) => e.target.value}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={Boolean(form.primaryError)}
      >
        {form.primaryError || 'Reset password'}
      </Button>

      <Grid container>
        <Grid item>
          <Link to={ROUTE_LOGIN} variant="body2">
            {'Back to Login'}
          </Link>
        </Grid>
      </Grid>
    </Box>
  );

  const renderOptConfirm = () => (
    <OtpConfirm
      email={form.values.email}
      method={async (code) => {
        const data = await resetPasswordComplete.mutateAsync({
          code,
          code_token: resetPasswordRequest.data?.code_token,
          new_password: form.values.new_password,
        });
        await authenticate(data.access_token, data.refresh_token);
      }}
    />
  );

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
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        {resetPasswordRequest.data ? renderOptConfirm() : renderForm()}
      </Box>
    </Container>
  );
};

export default ForgotPassword;
