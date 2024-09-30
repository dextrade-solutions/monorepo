import React, { useCallback, useState, useMemo } from 'react';
import Slider from '@material-ui/core/Slider';
import { useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

const SliderStyled = withStyles({
  root: {
    color: 'var(--color-primary-default);',
  },
  markLabel: {
    fontFamily: '"Rubik", Helvetica, Arial, sans-serif',
    textTransform: 'uppercase',
    fontSize: '0.49rem',
  },
  markLabelActive: {
    color: 'var(--color-text-default);',
  },
})(Slider);

const MIN_SATOSHI = 1000;

export const GasMultisignSliderInner = ({ value: incomeValue, onChange }) => {
  const [value, setValue] = useState(incomeValue);
  const networks = useSelector(({ metamask }) => metamask.usedNetworks || {});
  const { draftTransactions, currentTransactionUUID } = useSelector(
    ({ send }) => send,
  );

  const network = useMemo(
    () => networks.bitcoin?.network || networks.bitcoin_testnet?.network || {},
    [networks],
  );

  const {
    gas: { weight },
  } = useMemo(
    () => draftTransactions[currentTransactionUUID],
    [draftTransactions, currentTransactionUUID],
  );

  const min = Math.round(MIN_SATOSHI / weight);
  const low = Math.floor(network.lowFeePerKb / 1024);
  const medium = Math.ceil(network.mediumFeePerKb / 1024);
  const high = Math.floor(network.highFeePerKb / 1024);
  const max = Math.round((high + (high - low)) / 10) * 10;

  const handleChange = useCallback(
    (e, v) => {
      onChange && onChange(v);
      setValue(v);
    },
    [onChange],
  );

  return (
    <SliderStyled
      onChange={handleChange}
      defaultValue={value || low}
      value={value || low}
      // getAriaLabel={renderValue}
      // getAriaValueText={renderValue}
      step={1}
      valueLabelDisplay="auto"
      min={min}
      max={max}
      marks={[
        {
          value: min,
          label: 'min',
        },
        {
          value: low,
          label: 'low',
        },
        {
          value: medium,
          label: 'medium',
        },
        {
          value: high,
          label: 'high',
        },
        {
          value: max,
          label: 'max',
        },
      ]}
    />
  );
};
