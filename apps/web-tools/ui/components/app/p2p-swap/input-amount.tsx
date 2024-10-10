import { Box, InputAdornment, TextField } from '@mui/material';
import { NumericFormat } from 'react-number-format';
import { useDispatch, useSelector } from 'react-redux';

import {
  getFromToken,
  getFromTokenInputValue,
  getToToken,
  setFromTokenInputValue,
} from '../../../ducks/swaps/swaps';
import { ButtonIcon } from 'dex-ui';

export default function InputAmount() {
  const fromToken = useSelector(getFromToken);
  const toToken = useSelector(getToToken);
  const value = useSelector(getFromTokenInputValue);
  const dispatch = useDispatch();

  const updateValue = (v: string) => {
    dispatch(setFromTokenInputValue(v));
  };

  if (!fromToken || !toToken) {
    return null;
  }

  return (
    <Box marginTop={3}>
      <NumericFormat
        value={value}
        placeholder="You send amount"
        variant="standard"
        fullWidth
        customInput={TextField}
        decimalSeparator=","
        valueIsNumericString
        InputProps={{
          disableUnderline: true,
          style: {
            fontSize: 25,
          },
          endAdornment: (
            <InputAdornment position="end">
              {Number(value) > 0 && (
                <ButtonIcon
                  iconName="close"
                  color="secondary"
                  size="sm"
                  onClick={() => updateValue('')}
                />
              )}
            </InputAdornment>
          ),
        }}
        onChange={(e) => updateValue(e.target.value.replace(',', '.'))}
      />
    </Box>
  );
}
