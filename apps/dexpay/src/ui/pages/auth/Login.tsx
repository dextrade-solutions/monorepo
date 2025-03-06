import { Box, Container, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import LoginForm from '../../components/login/LoginForm';
import OtpConfirm from '../../components/OtpConfirm';
import { useAuth } from '../../hooks/use-auth';

const Login = () => {
  const [inviteParams, setInviteParams] = useState<{
    codeToken: string;
    otpValue: string;
  }>();
  const {
    twoFAdata: { codeToken: loginCodeToken },
    twoFA,
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

  const codeToken = inviteParams ? inviteParams.codeToken : loginCodeToken;
  const otpValue = inviteParams?.otpValue;

  const handleTwoFa = React.useCallback(
    (code: string) => {
      return twoFA(code, !inviteParams?.codeToken, codeToken);
    },
    [twoFA, inviteParams?.codeToken, codeToken],
  );

  const renderContent = useMemo(() => {
    return codeToken ? (
      <OtpConfirm value={otpValue} method={handleTwoFa} />
    ) : (
      <LoginForm />
    );
  }, [codeToken, handleTwoFa, otpValue]);

  return (
    <Container maxWidth="xs">
      <Box color="text.tertiary">
        <Typography variant="h4" component="h1" gutterBottom fontWeight="550">
          Welcome back, to Dex<strong>Pay</strong>!
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {renderContent}
      </Box>
    </Container>
  );
};

export default Login;
