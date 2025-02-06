import { Autocomplete, TextField } from '@mui/material';
import { MultiselectAssets, withValidationProvider } from 'dex-ui';

import DatePickerComponent from './ui/DatePicker';
import SelectCurrency from './ui/SelectCurrency';

export const TextFieldWithValidation = withValidationProvider(TextField);
export const DatePickerWithValidation = withValidationProvider(
  DatePickerComponent,
  (v) => (v ? v.toISOString().split('T')[0] : null),
);
export const AutocompleteWithValidation = withValidationProvider(
  Autocomplete,
  (_, v) => v,
);

export const SelectCurrencyWithValidation =
  withValidationProvider(SelectCurrency);

export const MultiselectAssetsWithValidation =
  withValidationProvider(MultiselectAssets);
