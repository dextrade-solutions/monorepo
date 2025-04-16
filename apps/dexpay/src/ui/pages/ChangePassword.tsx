// /Users/rkomarov/projects/dextrade/monorepo/apps/dexpay/src/ui/pages/auth/ForgotPassword.tsx
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { useForm } from 'dex-ui';
import React from 'react';

import { VPasswordField } from '../components/fields';
import OtpConfirm from '../components/OtpConfirm';
import Link from '../components/ui/Link';
import { ROUTE_PROFILE } from '../constants/pages';
import { useAuth } from '../hooks/use-auth';
import { useMutation } from '../hooks/use-query';
import { User } from '../services';
import { Validation } from '../validation';

interface ForgotPasswordFormValues {
  email: string;
  new_password: string;
}

const ChangePassword = () => {
  const { authenticate, me } = useAuth();
  const changePassword = useMutation(User.changePassword);
  const changePasswordConfirm = useMutation(User.changePasswordConfirm);

  const form = useForm<ForgotPasswordFormValues>({
    values: {
      email: me?.email || '',
      new_password: '',
    },
    validationSchema: Validation.Auth.forgotPassword,
    method: changePassword.mutateAsync,
  });

  const renderForm = () => (
    <Box
      width="100%"
      component="form"
      onSubmit={form.submit}
      noValidate
      sx={{ mt: 1 }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography color="text.secondary" variant="caption">Email</Typography>
        <Typography>{me?.email}</Typography>
      </Box>
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
        {form.primaryError || 'Change password'}
      </Button>
      <Grid container justifyContent="center">
        <Grid item>
          <Link to={ROUTE_PROFILE}>Go back</Link>
        </Grid>
      </Grid>
    </Box>
  );

  const renderOptConfirm = () => (
    <OtpConfirm
      email={form.values.email}
      method={async (code) => {
        await changePasswordConfirm.mutateAsync({
          code,
          code_token: changePassword.data?.code_token,
          new_password: form.values.new_password,
        });
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
          Change Password
        </Typography>
        {changePassword.data ? renderOptConfirm() : renderForm()}
      </Box>
    </Container>
  );
};

export default ChangePassword;
