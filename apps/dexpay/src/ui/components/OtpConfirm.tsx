import { Alert, Box, Button, Typography } from '@mui/material';
import { useGlobalModalContext, OtpInput, useLoader } from 'dex-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

import { ROUTE_HOME } from '../constants/pages';

const OtpConfirm = ({
  value: initialValue = '',
  email,
  method,
  resendMethod,
}: {
  value?: string;
  email?: string;
  method: (otp: string) => Promise<any>;
  resendMethod?: () => Promise<any>;
}) => {
  const [values, setForm] = useState({ otp: initialValue });
  const { showModal } = useGlobalModalContext();
  const loader = useLoader();
  const [, navigate] = useLocation();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      try {
        await loader.runLoader(method(values.otp));
        navigate(ROUTE_HOME);
      } catch (error: any) {
        setForm({ otp: '' });
        showModal({
          name: 'ALERT_MODAL',
          severity: 'error',
          text: error.message || 'Something went wrong',
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

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prevCooldown) => prevCooldown - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
      interval = null;
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!resendMethod) {
      throw new Error('Resend method not provided');
    }
    if (resendCooldown > 0 || isResending) {
      return;
    }

    setIsResending(true);
    try {
      await resendMethod();
      setResendCooldown(60); // 1 minute cooldown
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      data-testid="otp-form"
    >
      {email && (
        <Alert sx={{ my: 2 }} severity="info">
          We send you code to <strong>{email}</strong>, please check your inbox.
          Please enter the code here.
        </Alert>
      )}
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
      <Box mb={3} />
      {resendMethod && (
        <>
          {resendCooldown > 0 ? (
            <Typography textAlign="center" color="text.secondary">
              Resend code in {resendCooldown} seconds
            </Typography>
          ) : (
            <Button
              fullWidth
              color="tertiary"
              onClick={handleResend}
              disabled={isResending}
            >
              Send again
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default OtpConfirm;
