import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export function BasicDatePicker({ onChange }: { onChange: (v: any) => void }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
        onChange={onChange}
      />
    </LocalizationProvider>
  );
}
