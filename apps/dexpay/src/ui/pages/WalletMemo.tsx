import { Box, ButtonGroup, Typography } from '@mui/material';
import { Button, useLoader, useGlobalModalContext } from 'dex-ui';
import React, { useState, useEffect, useCallback } from 'react';

import { PGP } from '../../crypto/pgp';
import { SeedPhraseForm } from '../components/crypto/SaveSeedPhrase';
import OtpConfirm from '../components/OtpConfirm';
import { useAuth } from '../hooks/use-auth';
import { useMutation, useQuery } from '../hooks/use-query';
import { Memo, Projects } from '../services';
import { Memo as MemoTypes } from '../types';
import { Validation } from '../validation';

enum SetupStep {
  CHOOSE_STORAGE = 0,
  ON_SERVER = 1,
  IN_APP = 2,
  SCAN_QR = 4,
}

export default function WalletMemo() {
  const { showModal } = useGlobalModalContext();
  const [seedPhrase, setSeedPhrase] = useState<string[]>();
  const auth = useAuth();
  const { setCompleteReginstration } = useAuth();
  const { runLoader } = useLoader();
  const [beginImportResponse, setBeginImportResponse] =
    useState<MemoTypes.BeginImport.Response>();
  const [externalConnectionResponse, setExternalConnectionResponse] =
    useState<MemoTypes.ExternalConnection.Response>();
  const [
    externalConnectionCompleteResponse,
    setExternalConnectionCompleteResponse,
  ] = useState<MemoTypes.ExternalConnection.CompleteResponse>();
  const [qrCode, setQrCode] = useState<string>();
  const [connectionId, setConnectionId] = useState<string>();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const [step, setStep] = useState<SetupStep>(SetupStep.CHOOSE_STORAGE);

  const complete = useMutation(Memo.beginImport, {
    onSuccess: (data) => {
      setBeginImportResponse(data);
    },
  });

  const projectInit = useMutation(Projects.init, {
    onSuccess: () => {
      setCompleteReginstration();
    },
  });
  const confirmOtp = useMutation(Memo.completeImport, {
    onSuccess: (resp) => {
      return projectInit.mutateAsync([
        // @ts-expect-error id is always present
        { id: auth.user?.project!.id },
        { mnemonic_encrypted_id: resp.id },
      ]);
    },
  });

  const externalConnection = useMutation(Memo.externalConnection, {
    onSuccess: (data) => {
      setExternalConnectionResponse(data);
    },
  });

  const connectionStatus = useQuery(
    Memo.getExternalConnectionStatus,
    [connectionId!],
    {
      enabled: Boolean(connectionId) && step === SetupStep.SCAN_QR,
      refetchInterval: 3000,
    },
  );

  const calculateTimeRemaining = useCallback((expiryDate: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      return '00:00';
    }

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (connectionStatus.data) {
      if (connectionStatus.data.is_done) {
        setCompleteReginstration();
      }
    }
  }, [connectionStatus.data, setCompleteReginstration, showModal]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (connectionStatus.data?.expiryAt && !connectionStatus.data?.is_expired) {
      const timer = setInterval(() => {
        setTimeRemaining(
          calculateTimeRemaining(connectionStatus.data!.expiryAt),
        );
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [connectionStatus.data, calculateTimeRemaining]);

  const completeExternalConnection = useMutation(
    Memo.completeExternalConnection,
    {
      onSuccess: (data) => {
        setQrCode(data.qr_code);
        setConnectionId(data.id);
        setStep(SetupStep.SCAN_QR);
        setExternalConnectionCompleteResponse(data);
      },
    },
  );

  const handleOtp = async (otp: string) => {
    if (!beginImportResponse) {
      throw new Error('no begin import response');
    }
    if (!seedPhrase) {
      throw new Error('no seed phrase provided');
    }
    const encrypted = await PGP.encryptMessage(
      seedPhrase.join(' '),
      beginImportResponse.public_key,
    );
    await confirmOtp.mutateAsync([
      {
        id: beginImportResponse.id,
        code_token: beginImportResponse.code_token,
        code: otp,
        encrypted,
      },
    ]);
  };

  const handleExternalOtp = async (otp: string) => {
    if (!externalConnectionResponse) {
      throw new Error('no external connection response');
    }

    await completeExternalConnection.mutateAsync([
      {
        id: externalConnectionResponse.id,
        code_token: externalConnectionResponse.code_token as string,
        code: otp,
      },
    ]);
  };

  const handleOnServerSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (!seedPhrase) {
        throw new Error('No seed phrase provided');
      }
      await Validation.Crypto.seedPhrase.validate(seedPhrase); // Validate the seed phrase
      // If validation passes, proceed with the submission
      await runLoader(complete.mutateAsync([{ name: 'Seed Phrase 1' }]));
    } catch (error: unknown) {
      if (error instanceof Error) {
        showModal({
          name: 'ALERT_MODAL',
          severity: 'error',
          text: error.message,
        });
      } else {
        showModal({
          name: 'ALERT_MODAL',
          severity: 'error',
          text: 'An unknown error occurred',
        });
      }
    }
  };

  const handleOnMobileAppSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await runLoader(
        externalConnection.mutateAsync([{ name: 'DexTrade Mobile App' }]),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        showModal({
          name: 'ALERT_MODAL',
          severity: 'error',
          text: error.message,
        });
      } else {
        showModal({
          name: 'ALERT_MODAL',
          severity: 'error',
          text: 'An unknown error occurred',
        });
      }
    }
  };

  const tryAgainConnection = () => {
    setStep(SetupStep.CHOOSE_STORAGE);
    setExternalConnectionResponse(undefined);
    setExternalConnectionCompleteResponse(undefined);
    setQrCode(undefined);
    setConnectionId(undefined);
    setTimeRemaining('');
  };

  const connectionColor = React.useMemo(() => {
    if (connectionStatus.data?.is_done) {
      return 'success.main';
    } else if (connectionStatus.data?.is_expired) {
      return 'error.main';
    }
    return 'text.secondary';
  }, [connectionStatus.data?.is_done, connectionStatus.data?.is_expired]);

  const connectionText = React.useMemo(() => {
    if (connectionStatus.data?.is_done) {
      return 'Connection successful!';
    } else if (connectionStatus.data?.is_expired) {
      return 'Connection expired';
    }
    return 'Waiting for connection...';
  }, [connectionStatus.data?.is_done, connectionStatus.data?.is_expired]);

  const renderStep = () => {
    switch (step) {
      case SetupStep.CHOOSE_STORAGE:
        return (
          <>
            <Typography variant="h5" gutterBottom>
              Complete Registration
            </Typography>
            <Typography variant="body1" paragraph align="center">
              Keep the encrypted seed phrase:
            </Typography>

            <ButtonGroup
              orientation="vertical"
              aria-label="Vertical button group"
              sx={{ mt: 1, mb: 2 }}
            >
              <Button onClick={() => setStep(SetupStep.ON_SERVER)}>
                <Typography variant="body1" gutterBottom sx={{ margin: 0 }}>
                  On the server
                </Typography>
              </Button>
              <Button
                sx={{ display: 'flex', flexDirection: 'column' }}
                onClick={() => setStep(SetupStep.IN_APP)}
              >
                <Typography variant="body1" gutterBottom sx={{ margin: 0 }}>
                  In the mobile app
                </Typography>
              </Button>
            </ButtonGroup>
          </>
        );

      case SetupStep.ON_SERVER:
        return (
          <>
            {beginImportResponse ? (
              <OtpConfirm email={auth.me?.email} method={handleOtp} />
            ) : (
              <>
                <Typography variant="h5" gutterBottom>
                  Complete Registration
                </Typography>
                <Typography variant="body1" paragraph align="center">
                  Please save your seed phrase. This is a list of words that can
                  be used to recover your account if you lose access to it.
                </Typography>
                <Typography variant="body1" paragraph align="center">
                  Store it securely and never share it with anyone.
                </Typography>

                <Box
                  component="form"
                  onSubmit={handleOnServerSubmit}
                  noValidate
                >
                  <SeedPhraseForm value={seedPhrase} onChange={setSeedPhrase} />

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    gap={2}
                    mt={2}
                  >
                    <Button
                      type="button"
                      fullWidth
                      variant="outlined"
                      sx={{ mt: 3, mb: 2 }}
                      onClick={() => setStep(SetupStep.CHOOSE_STORAGE)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      gradient
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Continue
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </>
        );

      case SetupStep.IN_APP:
        return (
          <>
            {externalConnectionResponse ? (
              <>
                <Typography variant="h5" gutterBottom>
                  Connect Mobile Wallet
                </Typography>
                <Typography variant="body1" align="center" paragraph>
                  Keeping the encrypted seed phrase in the mobile app will
                  require signing all withdrawals on the phone.
                </Typography>
                <Typography variant="body1" align="center" paragraph>
                  Deleting the mobile app will remove the access to your wallet,
                  so make sure you save the phrase somewhere else.
                </Typography>

                <OtpConfirm email={auth.me?.email} method={handleExternalOtp} />
              </>
            ) : (
              <>
                <Typography variant="h5" gutterBottom>
                  Connect Mobile Wallet
                </Typography>
                <Typography variant="body1" align="center" paragraph>
                  Keeping the encrypted seed phrase in the mobile app will
                  require signing all withdrawals on the phone.
                </Typography>
                <Typography variant="body1" align="center" paragraph>
                  Deleting the mobile app will remove the access to your wallet,
                  so make sure you save the phrase somewhere else.
                </Typography>
                <Box
                  component="form"
                  onSubmit={handleOnMobileAppSubmit}
                  noValidate
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    gap={2}
                    mt={2}
                  >
                    <Button
                      type="button"
                      fullWidth
                      variant="outlined"
                      sx={{ mt: 3, mb: 2 }}
                      onClick={() => setStep(SetupStep.CHOOSE_STORAGE)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      gradient
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Continue
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </>
        );

      case SetupStep.SCAN_QR:
        return (
          <>
            <Typography variant="h5" gutterBottom>
              Scan QR Code
            </Typography>
            <Typography variant="body1" align="center" paragraph>
              Scan this QR code with your Dextrade mobile app to complete the
              connection
            </Typography>
            {qrCode && (
              <Box sx={{ textAlign: 'center' }}>
                {/* Connection ID Pill */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    mt: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Verify connection ID in mobile app matches:
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '16px',
                      px: 2,
                      py: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      letterSpacing: '0.09em',
                    }}
                  >
                    {connectionStatus.data?.public_id
                      ?.match(/.{1,4}/gu)
                      ?.join('') || '...'}
                  </Box>
                </Box>

                <a href={`${externalConnectionCompleteResponse?.deep_link}`}>
                  <Box
                    component="img"
                    src={qrCode}
                    alt="QR Code"
                    sx={{ width: 256, height: 256, marginTop: '12px' }}
                  />
                </a>

                <Typography
                  variant="body2"
                  color={connectionColor}
                  sx={{ mt: 1 }}
                >
                  {connectionText}
                </Typography>

                {/* Countdown Timer */}
                {!connectionStatus.data?.is_expired &&
                  !connectionStatus.data?.is_done && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        mt: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Expires in:
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: 'action.hover',
                          borderRadius: '12px',
                          px: 1.5,
                          py: 0.5,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          fontWeight: 'medium',
                          color:
                            timeRemaining === '00:00'
                              ? 'error.main'
                              : 'text.primary',
                        }}
                      >
                        {timeRemaining}
                      </Box>
                    </Box>
                  )}

                {connectionStatus.data?.is_expired && (
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={tryAgainConnection}
                  >
                    Try Again
                  </Button>
                )}
              </Box>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center horizontally
        justifyContent: 'center', // Center vertically
        minHeight: '80vh', // Ensure full viewport height for vertical centering
      }}
    >
      {renderStep()}
    </Box>
  );
}
