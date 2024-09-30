import React from 'react';
import PropTypes from 'prop-types';
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
} from '@material-ui/core';
import Popover from '../../../ui/popover';
import Box from '../../../ui/box';

export default function ItemPicker({
  value,
  items,
  onClose,
  onSelect,
  ...props
}) {
  return (
    <Popover onClose={onClose} {...props}>
      <FormControl>
        <RadioGroup
          value={value}
          onChange={(v) => {
            onSelect(v.target.value);
            onClose();
          }}
        >
          {items.map((item, idx) => (
            <Box className="bank-account-picker__option" key={idx}>
              <FormControlLabel
                value={item.value}
                control={<Radio color="primary" />}
                label={item.text}
              />
            </Box>
          ))}
        </RadioGroup>
      </FormControl>
    </Popover>
  );
}

ItemPicker.propTypes = {
  value: PropTypes.any,
  items: PropTypes.array,
  onSelect: PropTypes.func,
  onClose: PropTypes.func,
};
