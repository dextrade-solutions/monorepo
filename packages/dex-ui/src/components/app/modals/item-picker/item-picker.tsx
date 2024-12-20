import {
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from '@mui/material';

import { ModalProps } from '../types';

export const ItemPicker = ({
  value,
  options,
  onSelect,
  onClose,
  hideModal,
  getOptionLabel = (item) => item.text,
  getOptionKey = (item) => item.value,
  title,
}: {
  value: string;
  options: any[];
  onSelect: (v: string) => void;
  onClose: () => void;
  getOptionLabel: (v: any) => string;
  getOptionKey: (v: any) => string;
  title?: string;
} & ModalProps) => {
  const renderOptions: { text: string; value: string }[] = options.map(
    (item: any) => ({ text: getOptionLabel(item), value: getOptionKey(item) }),
  );
  return (
    <Box padding={3}>
      {title && (
        <Typography fontWeight="bold" marginBottom={2}>
          {title}
        </Typography>
      )}
      <FormControl>
        <RadioGroup
          value={value}
          onChange={(v) => {
            onSelect(v.target.value);
            hideModal();
            onClose();
          }}
        >
          {renderOptions.map((item, idx) => (
            <Box key={idx}>
              <FormControlLabel
                value={item.value}
                control={<Radio color="primary" />}
                label={item.text}
              />
            </Box>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default ItemPicker;
