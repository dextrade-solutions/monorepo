import '../styles.scss';
import {
  Modal,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import React from 'react';

export const ItemPicker: React.FC<{
  onSelect: (v: string) => void;
  onClose: () => void;
  value: string;
  items: { text: string; value: string }[];
}> = ({ items, onSelect, onClose, value }) => {
  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{ bgcolor: 'background.default' }}
        className="modal-generic"
        padding={2}
      >
        <FormControl>
          <RadioGroup
            value={value}
            onChange={(v) => {
              onSelect(v.target.value);
              onClose();
            }}
          >
            {items.map((item, idx) => (
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
    </Modal>
  );
};
