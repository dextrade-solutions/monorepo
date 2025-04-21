import { Box, InputAdornment } from '@mui/material';
import { ButtonIcon, NumericTextField } from 'dex-ui';
import { useDispatch, useSelector } from 'react-redux';

import {
  getFromToken,
  getFromTokenInputValue,
  getToToken,
  setFromTokenInputValue,
} from '../../../ducks/swaps/swaps';

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
      <NumericTextField
        value={value}
        placeholder="You send amount"
        variant="standard"
        fullWidth
        clearable
        valueIsNumericString
        InputProps={{
          disableUnderline: true,
          style: {
            fontSize: 25,
          },
        }}
        onChange={updateValue}
      />
    </Box>
  );
}
