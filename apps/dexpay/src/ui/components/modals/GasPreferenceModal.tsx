import {
  Box,
  Dialog,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import React from 'react';
import { navigate } from 'wouter/use-hash-location';

interface GasPreferenceModalProps {
  open: boolean;
  onClose: () => void;
}

const USDT_OPTIONS = [
  { label: 'USDT ETH', value: 'USDT_ETH' },
  { label: 'USDT TRC', value: 'USDT_TRX' },
  { label: 'USDT BSC', value: 'USDT_BSC' },
  { label: 'USDT SOL', value: 'USDT_SOL' },
];

export default function GasPreferenceModal({
  open,
  onClose,
}: GasPreferenceModalProps) {
  const handleUsdtSelect = (iso: string) => {
    localStorage.setItem('gasPreference', iso);
    navigate(`/wallet/deposit/${iso}`, {
      state: { transfer_from: 'true' },
    });
    onClose();
  };

  const handleNativeTokens = () => {
    localStorage.setItem('gasPreference', 'NATIVE');
    onClose();
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Gas Fee Preference
        </Typography>

        <Typography sx={{ mt: 2, mb: 3 }} align="center">
          To save your time we can use your USDT for gas fees instead of native
          tokens.
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Deposit:
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          {USDT_OPTIONS.map((option) => (
            <Card
              key={option.value}
              elevation={0}
              sx={{
                bgcolor: 'secondary.dark',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'secondary.main' },
              }}
              onClick={() => handleUsdtSelect(option.value)}
            >
              <CardContent>
                <Typography>{option.label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleNativeTokens}
          sx={{ mt: 2 }}
        >
          No, always use native tokens
        </Button>
      </Box>
    </Dialog>
  );
}
