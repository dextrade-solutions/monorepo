import { Alert, Box } from '@mui/material';
import { useGlobalModalContext, OtpInput, useLoader } from 'dex-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

import { ROUTE_HOME } from '../constants/pages';

const OtpConfirm = ({
  value: initialValue = '',
  method,
}: {
  value?: string;
  method: (otp: string) => Promise<any>;
}) => {
  const [values, setForm] = useState({ otp: initialValue });
  const { showModal } = useGlobalModalContext();
  const loader = useLoader();
  const [, navigate] = useLocation();

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      try {
        await loader.runLoader(method(values.otp));
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
    [showModal, method, navigate, loader, values.otp],
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
      data-testid="otp-form"
    >
      <Alert sx={{ my: 2 }} severity="info">
        We send you code to email, please check your inbox. Please enter the
        code here.
      </Alert>
      <OtpInput
        margin="normal"
        length={4}
        autoFocus
        TextFieldsProps={{
          variant: 'outlined',
          placeholder: '-',
          inputProps: { inputMode: 'numeric', pattern: '[0-9]*' },
        }}
        value={values.otp}
        onChange={handleInputChange}
        data-testid="otp-input" // Added data-testid
      />
    </Box>
  );
};

export default OtpConfirm;
