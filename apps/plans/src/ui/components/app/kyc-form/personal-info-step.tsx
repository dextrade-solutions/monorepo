import {
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
  DatePickerWithValidation,
  TextFieldWithValidation,
} from './fields';
import { StepProps } from './types';
import DextradeService from '../../../../services/dextrade';
import { isRequired } from '../../../helpers/constants/validators';

const MOCK = {
  firstName: 'John',
  lastName: 'Snow',
  dob: null,
  residenceCountry: { iso: 'AR', name: 'AR' },
  email: 'johnsnow@gmail.com',
  phone: null,
};

export function PersonalInfoStep({ onSubmit }: StepProps) {
  const [form, setForm] = useState({});
  const { t } = useTranslation();
  const formRef = useRef<{ [k: string]: string[] }>({});
  const isFormInitialized = Object.values(formRef.current).length > 0;
  const formError = Object.values(formRef.current).find((v) => v[0]);

  const updateForm = (field: string, value: any) => {
    setForm((oldForm) => ({ ...oldForm, [field]: value }));
  };

  const { data: countries = [] } = useQuery({
    queryKey: ['kycCountries'],
    queryFn: () =>
      DextradeService.countries().then((response) => response.data),
  });

  const save = async () => {
    // formRef.current.validate();
    await DextradeService.firstStep({
      firstName: form.firstName,
      lastName: form.lastName,
      dob: form.dob,
      residenceCountry: form.residenceCountry.iso,
      email: form.email,
      phone: form.phone,
    });
    onSubmit();
  };

  return (
    <Card sx={{ backgroundColor: 'transparent' }}>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('First name')}
        </Typography>
        <TextFieldWithValidation
          value={form.firstName}
          name="firstName"
          validators={[isRequired]}
          fullWidth
          form={formRef}
          placeholder="John"
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Last name')}
        </Typography>
        <TextFieldWithValidation
          value={form.lastName}
          name="lastName"
          validators={[isRequired]}
          fullWidth
          form={formRef}
          placeholder="Snow"
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Date of Birth')}
        </Typography>
        <DatePickerWithValidation
          value={form.dob}
          name="dob"
          form={formRef}
          validators={[isRequired]}
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Residence country')}
        </Typography>
        <AutocompleteWithValidation
          value={form.residenceCountry}
          name="residenceCountry"
          form={formRef}
          validators={[isRequired]}
          fullWidth
          disablePortal
          disabled={!countries.length}
          options={countries}
          getOptionKey={(option) => option.iso}
          getOptionLabel={(option) => t(option.iso)}
          renderInput={(params) => (
            <TextField {...params} placeholder="Select you country" />
          )}
          onChange={updateForm}
          renderOption={(props, option) => {
            const { key, ...optionProps } = props;
            return (
              <Box
                key={key}
                component="li"
                sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                {...optionProps}
              >
                <img
                  loading="lazy"
                  width="20"
                  srcSet={`https://flagcdn.com/w40/${option.iso.toLowerCase()}.png 2x`}
                  src={`https://flagcdn.com/w20/${option.iso.toLowerCase()}.png`}
                  alt=""
                />
                {t(option.iso)} ({option.iso})
              </Box>
            );
          }}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Email')}
        </Typography>
        <TextFieldWithValidation
          value={form.email}
          name="email"
          form={formRef}
          validators={[isRequired]}
          fullWidth
          placeholder="johndoe@gmail.com"
          onChange={updateForm}
        />
      </CardContent>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {t('Phone number')}
        </Typography>
        <TextFieldWithValidation
          value={form.phone}
          name="phone"
          form={formRef}
          // validators={[isRequired]}
          fullWidth
          placeholder="Phone number"
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
