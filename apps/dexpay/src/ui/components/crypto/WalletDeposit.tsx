import {
  Box,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { shortenAddress } from 'dex-helpers';
import assetDict from 'dex-helpers/assets-dict';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';

import WalletDepositAddress from './WalletDepositAddress';
import SelectCurrency from '../ui/SelectCurrency';

interface WalletDepositParams {
  iso?: string;
}

export default function WalletDeposit() {
  const [activeStep, setActiveStep] = useState(0);
  const [currency, setCurrency] = useState();
  const { iso } = useParams<WalletDepositParams>();

  useEffect(() => {
    if (currency) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  }, [currency]);

  return (
    <Stepper activeStep={activeStep} orientation="vertical">
      <Step active>
        <StepLabel>Choose crypto to deposit</StepLabel>
        <StepContent>
          <SelectCurrency
            variant="contained"
            value={currency}
            initialValueIso={iso}
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
      <Step>
        <StepLabel>Share address</StepLabel>
        <StepContent>
          {currency && <WalletDepositAddress currency={currency.currency} />}
        </StepContent>
      </Step>
    </Stepper>
  );
}
