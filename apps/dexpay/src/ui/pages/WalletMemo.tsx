import { Box, Typography } from '@mui/material';
import { GradientButton, useLoader } from 'dex-ui';
import React, { useState } from 'react';

import { PGP } from '../../crypto/pgp';
import { SeedPhraseForm } from '../components/crypto/SaveSeedPhrase';
import OtpConfirm from '../components/OtpConfirm';
import { useAuth } from '../hooks/use-auth';
import { useMutation } from '../hooks/use-query';
import { Memo } from '../services';
import { Memo as MemoTypes } from '../types';

export default function WalletMemo() {
  const [seedPhrase, setSeedPhrase] = useState<string[]>();
  const { setCompleteReginstration } = useAuth();
  const { runLoader } = useLoader();
  const [beginImportResponse, setBeginImportResponse] =
    useState<MemoTypes.BeginImport.Response>();

  const complete = useMutation(Memo.beginImport, {
    onSuccess: (data) => {
      setBeginImportResponse(data);
    },
  });
  const confirmOtp = useMutation(Memo.completeImport, {
    onSuccess: () => {
      setCompleteReginstration();
    },
  });

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runLoader(complete.mutateAsync([{ name: 'Seed Phrase 1' }]));
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
      {beginImportResponse ? (
        <OtpConfirm method={handleOtp} />
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Complete Registration
          </Typography>
          <Typography variant="body1" paragraph align="center">
            Please save your seed phrase. This is a list of words that can be
            used to recover your account if you lose access to it.
          </Typography>
          <Typography variant="body1" paragraph align="center">
            Store it securely and never share it with anyone.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <SeedPhraseForm value={seedPhrase} onChange={setSeedPhrase} />

            <GradientButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Continue
            </GradientButton>
          </Box>
        </>
      )}
    </Box>
  );
}
