import {
  Box,
  Button,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { shortenAddress } from 'dex-helpers';
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

import WalletDepositAddress from './WalletDepositAddress';
import SelectCurrency from '../ui/SelectCurrency';

export default function WalletDeposit() {
  const [activeStep, setActiveStep] = useState(0);
  const [currency, setCurrency] = useState();

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
          <SelectCurrency value={currency} onChange={(v) => setCurrency(v)} />
          {currency && currency.extra.currency.contract_address && (
            <Box display="flex" mt={1}>
              <Typography mr={1} color="text.secondary">
                Contract address:{' '}
              </Typography>
              <Link href={`https://bscscan.com/address/`}>
                {shortenAddress(currency.extra.currency.contract_address)}
              </Link>
            </Box>
          )}
        </StepContent>
      </Step>
      <Step>
        <StepLabel>Share address</StepLabel>
        <StepContent>
          {/* {currency && (
            <WalletDepositAddress currency={currency.extra.currency} />
          )} */}
        </StepContent>
      </Step>
    </Stepper>
  );
}
