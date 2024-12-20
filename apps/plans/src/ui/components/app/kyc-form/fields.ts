import { Autocomplete, TextField } from '@mui/material';

import { DocInfoFileUploader } from './doc-info-file-uploader';
import { withValidationProvider } from '../../../hoc/with-validation-provider';
import BasicDatePicker from '../../ui/date-picker';

export const TextFieldWithValidation = withValidationProvider(
  TextField,
  (e) => e.target.value,
);
export const DatePickerWithValidation = withValidationProvider(
  BasicDatePicker,
  (v) => (v ? v.toISOString().split('T')[0] : null),
);
export const AutocompleteWithValidation = withValidationProvider(
  Autocomplete,
  (_, v) => v,
);
export const DocInfoFileUploaderWithValidation = withValidationProvider(
  DocInfoFileUploader,
  (v) => v,
);
