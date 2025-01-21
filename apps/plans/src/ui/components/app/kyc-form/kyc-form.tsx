import {
  Alert,
  Box,
  Button,
  Step,
  StepButton,
  Stepper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AddressInfoStep } from './address-info-step';
import { DocInfoStep } from './doc-info-step';
import { PersonalInfoStep } from './personal-info-step';
import { StepProps } from './types';
import DextradeService from '../../../../services/dextrade';

const STEPS = [
  {
    name: 'Personal info',
    content: (props: StepProps) => <PersonalInfoStep {...props} />,
  },
  {
    name: 'Documents info',
    content: (props: StepProps) => <DocInfoStep {...props} />,
  },
  {
    name: 'Address info',
    content: (props: StepProps) => <AddressInfoStep {...props} />,
  },
];

export function KycForm() {
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(0);

  const isCompleted = STEPS.length === currentStep;

  const nextStep = () => {
    setCurrentStep((v) => v + 1);
  };

  const getKyc = () => {
    return DextradeService.getKyc();
  };

  const deleteKyc = async () => {
    const response = await getKyc();
    DextradeService.deleteKyc(response.data.id);
  };

  const verifyKyc = () => {
    DextradeService.verifyKyc();
  };

  return (
    <Box>
      <Typography
        textAlign="center"
        variant="h4"
        fontWeight="bold"
        marginLeft={1}
        marginBottom={2}
      >
        {t('KYC')}
      </Typography>

      <Box marginY={3}>
        <Stepper alternativeLabel activeStep={currentStep}>
          {STEPS.map(({ name: label }, index) => (
            <Step key={label} completed={index < currentStep}>
              <StepButton color="inherit">{label}</StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
      {isCompleted ? (
        <Box margin={1}>
          <Typography variant="body2" color="text.secondary">
            Current status
          </Typography>
          <Alert severity="success">Completed</Alert>
        </Box>
      ) : (
        <Box>{STEPS[currentStep].content({ onSubmit: nextStep })}</Box>
      )}
      <Box display="flex" justifyContent="space-evenly" m={2}>
        <Button onClick={deleteKyc}>Delete KYC</Button>
        <Button onClick={getKyc}>Get KYC</Button>
        <Button onClick={verifyKyc}>Verify KYC</Button>
      </Box>
    </Box>
  );
}
