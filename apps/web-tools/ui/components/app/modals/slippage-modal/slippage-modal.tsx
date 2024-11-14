import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { Component, ReactNode } from 'react';
import { NumericFormat } from 'react-number-format';

import withModalProps from '../../../../helpers/hoc/with-modal-props';
import { ModalProps } from '../types';

const DEFAULT_SLIPPAGE = 0.5;

class SlippageModal extends Component<
  {
    value: number;
    onChange: (value: number) => void;
  } & ModalProps
> {
  constructor(props) {
    super(props);

    if (props.value) {
      this.state = {
        value: Number(props.value),
      };
    }
  }

  state = {
    value: DEFAULT_SLIPPAGE,
  };

  render(): ReactNode {
    const { value } = this.state;
    return (
      <Box padding={3}>
        <Typography fontWeight="bold" marginBottom={2}>
          Slippage configure
        </Typography>
        <Box display="flex">
          <Button
            size="large"
            variant={value === 0.1 ? 'contained' : 'outlined'}
            onClick={() => this.setState({ value: 0.1 })}
          >
            0.1%
          </Button>
          <Box mr={1} />
          <Button
            size="large"
            variant={value === 0.5 ? 'contained' : 'outlined'}
            onClick={() => this.setState({ value: 0.5 })}
          >
            0.5%
          </Button>
          <Box mr={1} />
          <Button
            size="large"
            variant={value === 1 ? 'contained' : 'outlined'}
            onClick={() => this.setState({ value: 1 })}
          >
            1.0%
          </Button>
          <Box mr={1} />
          <NumericFormat
            value={value}
            customInput={TextField}
            decimalSeparator="."
            placeholder="0"
            allowNegative={false}
            fullWidth
            variant="outlined"
            valueIsNumericString
            onChange={(e) => {
              this.setState({ value: e.target.value });
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Box>
        <Box display="flex" marginTop={3}>
          <Button onClick={this.props.hideModal}>Close</Button>
          <Box className="flex-grow"></Box>
          <Button
            variant="contained"
            onClick={() => {
              this.props.onChange(value);
              this.props.hideModal();
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    );
  }
}

const SlippageModalComponent = withModalProps(SlippageModal);

export default SlippageModalComponent;
