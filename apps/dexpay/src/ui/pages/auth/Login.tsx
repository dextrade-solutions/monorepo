import { Box, Container, Typography } from '@mui/material';
import { Button, useForm } from 'dex-ui';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { VPasswordField } from '../../components/fields';
import LoginForm from '../../components/login/LoginForm';
import OtpConfirm from '../../components/OtpConfirm';
import { useAuth } from '../../hooks/use-auth';
import { Validation } from '../../validation';

const Login = () => {
  const auth = useAuth();
  const loginForm = useForm({
    values: {
      email: '',
      password: '',
    },
    validationSchema: Validation.Auth.signIn,
    method: (values) => auth.login(values.email, values.password),
  });
  const [inviteParams, setInviteParams] = useState<{
    codeToken: string;
    otpValue: string;
  }>();
  const {
    twoFAdata: { codeToken: loginCodeToken },
    twoFA,
    clearTwoFA,
  } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invite = urlParams.get('invite');

    if (invite) {
      const [otpValue, inviteCodeToken] = invite.split(':');
      setInviteParams({
        otpValue,
        codeToken: inviteCodeToken,
      });
    }
  }, []);

  const defaultLogin = useMemo(() => {
    return loginCodeToken ? (
      <>
        <OtpConfirm
          email={loginForm.values.email}
          method={(code) => twoFA({ code })}
          resendMethod={loginForm.submit}
        />
        <Button
          fullWidth
          color="tertiary"
          size="large"
          sx={{
            marginTop: 2,
          }}
          startIcon={<ArrowLeft size={20} />}
          onClick={clearTwoFA}
        >
          Go back
        </Button>
      </>
    ) : (
      <Box>
        <LoginForm form={loginForm} />
      </Box>
    );
  }, [loginCodeToken, loginForm, twoFA, clearTwoFA]);

  const invationForm = useForm({
    values: {
      newPassword: '',
      confirmNewPassword: '',
    },
    validationSchema: Validation.Auth.invation,
    method: (values) => {
      if (!inviteParams) {
        throw new Error('No invite params');
      }
      return twoFA({
        code: inviteParams.otpValue,
        isNewMode: false,
        codeToken: inviteParams.codeToken,
        newPassword: values.newPassword,
      });
    },
  });

  return (
    <Container maxWidth="xs">
      <Box color="text.tertiary">
        <Typography variant="h4" component="h1" gutterBottom fontWeight="550">
          {inviteParams ? (
            <>Accept Invitation</>
          ) : (
            <>
              Welcome back, to Dex<strong>Pay</strong>!
            </>
          )}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {inviteParams ? (
          <Box>
            <Typography color="text.tertiary">
              Create your new password
            </Typography>
            <VPasswordField
              label="New password"
              data-testid="password-new"
              margin="normal"
              fullWidth
              autoComplete="new-password"
              name="newPassword"
              form={invationForm}
              onChange={(e) => e.target.value}
            />
            <VPasswordField
              label="Confirm password"
              data-testid="password-new-confirm"
              margin="normal"
              fullWidth
              autoComplete="new-password"
              name="confirmNewPassword"
              form={invationForm}
              onChange={(e) => e.target.value}
            />
            <Button
              sx={{ mt: 3 }}
              gradient
              fullWidth
              onClick={invationForm.submit}
            >
              Confirm
            </Button>
          </Box>
        ) : (
          defaultLogin
        )}
      </Box>
    </Container>
  );
};

export default Login;
