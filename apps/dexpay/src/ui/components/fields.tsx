import { Autocomplete, Checkbox, TextField } from '@mui/material';
import {
  MultiselectAssets,
  NumericTextField,
  PasswordField,
  withValidationProvider,
} from 'dex-ui';

import AutocompleteCoin from './ui/AutocompleteCoin';
import DatePickerComponent from './ui/DatePicker';
import PickCoin from './ui/PickCoin';
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

export const VPasswordField = withValidationProvider(PasswordField);
export const VPickCoin = withValidationProvider(PickCoin);
export const VNumericTextField = withValidationProvider(NumericTextField);
export const VAutocompleteCoin = withValidationProvider(AutocompleteCoin);
export const VCheckbox = withValidationProvider(
  ({ value, handleChange, ...props }) => {
    return (
      <Checkbox
        {...props}
        checked={value}
        onChange={(e) => handleChange(e.target.checked)}
      />
    );
  },
);
