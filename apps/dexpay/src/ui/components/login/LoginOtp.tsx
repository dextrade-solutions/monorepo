import { Box, Button, Typography } from '@mui/material';
import { useForm, useGlobalModalContext } from 'dex-ui';
import { MuiOtpInput } from 'mui-one-time-password-input';
import React, { useCallback, useEffect, useState } from 'react';

import { useUser } from '../../hooks/use-user';
import { Validation } from '../../validation';
import { TextFieldWithValidation } from '../fields';

const LoginOtp = () => {
  const [values, setForm] = useState({ otp: '' });
  const { showModal } = useGlobalModalContext();
  const { twoFA, two } = useUser();
  const form = useForm();

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      try {
        await twoFA(values.otp);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.otp]);

  // if (!codeToken) {
  //   return null;
  // }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <MuiOtpInput
        margin="normal"
        length={4}
        autoFocus
        TextFieldsProps={{
          variant: 'outlined',
          type: 'number',
        }}
        label="OTP"
        autoComplete="one-time-code"
        value={values.otp}
        validationForm={form}
        name="otp"
        onChange={handleInputChange}
      />
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
        {form.primaryError || 'Verify OTP'}
      </Button>
    </Box>
  );
};

export default LoginOtp;
