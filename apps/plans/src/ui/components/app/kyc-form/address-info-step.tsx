import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StepProps } from './types';
import DextradeService from '../../../../services/dextrade';
import { AutocompleteWithValidation, TextFieldWithValidation } from './fields';
import { isRequired } from '../../../helpers/constants/validators';

export function AddressInfoStep({ onSubmit }: StepProps) {
  const [form, setForm] = useState({
    type: {
      name: 'REGISTERED',
      description: 'REGISTERED',
    },
    country: 'Zimbabwe',
    stateOrProvince: null,
    city: null,
    postalCode: null,
    streetName: null,
    buildingNumber: null,
  });
  const { t } = useTranslation();
  const formRef = useRef<{ [k: string]: string[] }>({});
  const isFormInitialized = Object.values(formRef.current).length > 0;
  const formError = Object.values(formRef.current).find((v) => v[0]);
  const updateForm = (field: string, value: any) => {
    setForm((oldForm) => ({ ...oldForm, [field]: value }));
  };

  const { isLoading, data: docTypes = [] } = useQuery({
    queryKey: ['kycAddressTypes'],
    queryFn: () =>
      DextradeService.addressTypes().then((response) => response.data),
  });

  const save = async () => {
    await DextradeService.thirdStep({
      type: form.type,
      country: form.country,
      stateOrProvince: form.stateOrProvince,
      city: form.city,
      postalCode: form.postalCode,
      streetName: form.streetName,
      buildingNumber: form.buildingNumber,
    });
    onSubmit();
  };

  return (
    <Card sx={{ backgroundColor: 'transparent' }}>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Address type')}
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
          getOptionKey={(option) => option.iso}
          getOptionLabel={(option) => t(option.name)}
          renderInput={(params) => (
            <TextField {...params} placeholder="Select address type" />
          )}
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Country')}
        </Typography>
        <TextFieldWithValidation
          value={form.country}
          name="country"
          form={formRef}
          validators={[isRequired]}
          fullWidth
          placeholder="Zimbabwe"
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('State or province')}
        </Typography>
        <TextFieldWithValidation
          value={form.stateOrProvince}
          name="stateOrProvince"
          form={formRef}
          validators={[isRequired]}
          fullWidth
          placeholder="Zimbabwe"
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('City')}
        </Typography>
        <TextFieldWithValidation
          value={form.city}
          name="city"
          form={formRef}
          validators={[isRequired]}
          fullWidth
          placeholder="Zimbabwe"
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Postal Code')}
        </Typography>
        <TextFieldWithValidation
          value={form.postalCode}
          name="postalCode"
          form={formRef}
          validators={[isRequired]}
          type="number"
          fullWidth
          placeholder="Zimbabwe"
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Street Name')}
        </Typography>
        <TextFieldWithValidation
          value={form.streetName}
          name="streetName"
          form={formRef}
          validators={[isRequired]}
          fullWidth
          placeholder="Zimbabwe"
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Building number')}
        </Typography>
        <TextFieldWithValidation
          value={form.buildingNumber}
          name="buildingNumber"
          form={formRef}
          validators={[isRequired]}
          type="number"
          fullWidth
          placeholder="1"
          onChange={updateForm}
        />
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
