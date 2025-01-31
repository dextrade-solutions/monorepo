import { TextField, TextFieldProps } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import React from 'react';

interface Props {
  label?: string;
  value: dayjs.Dayjs | null;
  onChange: (newValue: dayjs.Dayjs | null) => void;
  textFieldProps?: TextFieldProps;
}

const DatePickerComponent: React.FC<Props> = ({
  label,
  value,
  onChange,
  textFieldProps = {},
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        sx={{
          width: '100%',
          mt: 2,
          mb: 1,
        }}
        label={label}
        value={value}
        onChange={onChange}
        renderInput={(params) => (
          <TextField {...textFieldProps} {...params} fullWidth />
        )}
      />
    </LocalizationProvider>
  );
};

export default DatePickerComponent;
