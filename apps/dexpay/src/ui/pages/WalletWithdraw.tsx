import {
  Box,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { shortenAddress } from 'dex-helpers';
import { Button, NumericTextField, useForm } from 'dex-ui';
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

import OtpConfirm from '../components/OtpConfirm';
import SelectCurrency from '../components/ui/SelectCurrency';
import useAddresses from '../hooks/use-addresses';
import { useAuth } from '../hooks/use-auth';
import { useMutation } from '../hooks/use-query';
import { Transaction } from '../services';

// import WalletDepositAddress from './WalletDepositAddress';

export default function WalletDeposit() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [currency, setCurrency] = useState();
  const [twoFa, setTwoFa] = useState<{ id: number; codeToken: string }>();
  const { user } = useAuth();
  const projectId = user?.project.id!;

  const addresses = useAddresses({ currencyId: currency?.currency.id });

  const widthdrawalCreate = useMutation(Transaction.withdrawalCreate, {
    onSuccess: (data) => {
      setTwoFa({ codeToken: data.twoFa.code_token, id: data.id });
    },
  });
  const widthdrawalConfirm = useMutation(Transaction.withdrawalConfirm);

  useEffect(() => {
    if (recipient && currency) {
      setActiveStep(2);
    } else if (currency) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  }, [currency, recipient]);

  const form = useForm({
    method: () => {
      const [fromAddress] = addresses.items;
      if (!fromAddress) {
        throw new Error('No from address loaded');
      }
      return widthdrawalCreate.mutateAsync([
        { projectId },
        {
          address_from_id: fromAddress.id,
          address_to: recipient,
          amount,
        },
      ]);
    },
  });

  if (twoFa) {
    return (
      <Box>
        <Typography mb={2} variant="h5" fontWeight="bold">
          Confirm withdrawal
        </Typography>
        <OtpConfirm
          method={(code) =>
            widthdrawalConfirm.mutateAsync([
              { projectId },
              { id: twoFa.id, code_token: twoFa.codeToken, code },
            ])
          }
        />
      </Box>
    );
  }

  return (
    <Stepper activeStep={activeStep} orientation="vertical">
      <Step active>
        <StepLabel>Choose crypto to withdraw</StepLabel>
        <StepContent>
          <SelectCurrency
            variant="contained"
            value={currency}
            onChange={(v) => setCurrency(v)}
          />
          {currency && currency.currency.contract_address && (
            <Box display="flex" mt={1}>
              <Typography mr={1} color="text.secondary">
                Contract address:{' '}
              </Typography>
              <Link href={`https://bscscan.com/address/`}>
                {shortenAddress(currency.currency.contract_address)}
              </Link>
            </Box>
          )}
        </StepContent>
      </Step>
      <Step active>
        <StepLabel>Recipient address</StepLabel>
        <StepContent>
          <TextField
            fullWidth
            placeholder="Paste recipient address here"
            onChange={(e) => setRecipient(e.target.value)}
          />
        </StepContent>
      </Step>
      <Step>
        <StepLabel>Enter amount</StepLabel>
        <StepContent>
          <NumericTextField
            fullWidth
            InputProps={{
              endAdornment: <Typography>{currency?.symbol}</Typography>,
            }}
            value={amount}
            placeholder="Amount"
            onChange={setAmount}
          />
        </StepContent>
      </Step>
      <Button sx={{ mt: 4 }} gradient onClick={form.submit}>
        Send
      </Button>
    </Stepper>
  );
}
