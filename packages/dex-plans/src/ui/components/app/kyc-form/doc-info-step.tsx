import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  AutocompleteWithValidation,
  DocInfoFileUploaderWithValidation,
  TextFieldWithValidation,
  DatePickerWithValidation,
} from './fields';
import { StepProps } from './types';
import DextradeService from '../../../../services/dextrade';
import { isRequired } from '../../../helpers/constants/validators';

export function DocInfoStep({ onSubmit }: StepProps) {
  const [form, setForm] = useState({
    type: {
      name: 'PASSPORT',
      description: 'PASSPORT',
    },
    documentNumber: null,
    issueDate: null,
    expiryDate: null,
    frontSide: null,
    backSide: null,
  });
  const { t } = useTranslation();
  const formRef = useRef<{ [k: string]: string[] }>({});
  const isFormInitialized = Object.values(formRef.current).length > 0;
  const formError = Object.values(formRef.current).find((v) => v[0]);
  const updateForm = (field: string, value: any) => {
    setForm((oldForm) => ({ ...oldForm, [field]: value }));
  };

  const { isLoading, data: docTypes = [] } = useQuery({
    queryKey: ['kycDocTypes'],
    queryFn: () => DextradeService.docTypes().then((response) => response.data),
  });

  const save = async () => {
    await DextradeService.secondStep({
      type: form.type.name,
      documentNumber: form.documentNumber,
      issueDate: form.issueDate,
      expiryDate: form.expiryDate,
      frontSide: form.frontSide,
      backSide: form.backSide,
    });
    onSubmit();
  };

  return (
    <Card sx={{ backgroundColor: 'transparent' }}>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Document type')}
        </Typography>
        <AutocompleteWithValidation
          value={form.type}
          name="type"
          form={formRef}
          validators={[isRequired]}
          fullWidth
          disablePortal
          disabled={isLoading}
          options={docTypes}
          getOptionLabel={(option) => t(option.name)}
          renderInput={(params) => (
            <TextField {...params} placeholder="Select document type" />
          )}
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Document number')}
        </Typography>
        <TextFieldWithValidation
          value={form.documentNumber}
          name="documentNumber"
          form={formRef}
          validators={[isRequired]}
          fullWidth
          placeholder="123456789"
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Issue date')}
        </Typography>
        <DatePickerWithValidation
          value={form.issueDate}
          name="issueDate"
          form={formRef}
          validators={[isRequired]}
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Expiration date')}
        </Typography>
        <DatePickerWithValidation
          value={form.expiryDate}
          name="expiryDate"
          form={formRef}
          validators={[isRequired]}
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Attach pictures')}
        </Typography>
        <Box display="flex">
          <DocInfoFileUploaderWithValidation
            value={form.frontSide}
            name="frontSide"
            form={formRef}
            validators={[isRequired]}
            label={t('1. Upload front side')}
            onChange={updateForm}
          />
          <Box marginX={1} />
          <DocInfoFileUploaderWithValidation
            value={form.backSide}
            name="backSide"
            form={formRef}
            validators={[isRequired]}
            label={t('2. Upload back side')}
            onChange={updateForm}
          />
        </Box>
      </CardContent>
      <CardContent>
        <Button
          disabled={!isFormInitialized || Boolean(formError)}
          fullWidth
          variant="contained"
          size="large"
          onClick={save}
        >
          {formError || t('Submit')}
        </Button>
      </CardContent>
    </Card>
  );
}
