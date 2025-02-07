import { Alert, Box } from '@mui/material';
import { useForm, useGlobalModalContext, useLoader } from 'dex-ui';
import { MuiOtpInput } from 'mui-one-time-password-input';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

import { ROUTE_HOME } from '../../constants/pages';
import { useUser } from '../../hooks/use-user';

const LoginOtp = ({ old }: { old?: boolean }) => {
  const [values, setForm] = useState({ otp: '' });
  const { showModal } = useGlobalModalContext();
  const { twoFA } = useUser();
  const form = useForm();
  const loader = useLoader();
  const [, navigate] = useLocation();

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      try {
        await loader.runLoader(twoFA(values.otp, !old));
        navigate(ROUTE_HOME);
      } catch (error) {
        setForm({ otp: '' });
        showModal({
          name: 'ALERT_MODAL',
          severity: 'error',
          text: error.message,
        });
      }
    },
    [showModal, form, twoFA],
  );

  const handleInputChange = (v: string) => {
    setForm({ otp: v });
  };

  useEffect(() => {
    if (values.otp.length === 4) {
      handleSubmit();
    }
  }, [values.otp]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      data-testid="login-otp-form"
    >
      <Alert sx={{ my: 2 }} severity="info">
        We send you code to email, please check your inbox. Please enter the
        code here.
      </Alert>
      <MuiOtpInput
        margin="normal"
        length={4}
        autoFocus
        TextFieldsProps={{
          variant: 'outlined',
        }}
        type="number"
        label="OTP"
        autoComplete="one-time-code"
        value={values.otp}
        validationForm={form}
        name="otp"
        onChange={handleInputChange}
        data-testid="login-otp-input" // Added data-testid
      />
    </Box>
  );
};

export default LoginOtp;
