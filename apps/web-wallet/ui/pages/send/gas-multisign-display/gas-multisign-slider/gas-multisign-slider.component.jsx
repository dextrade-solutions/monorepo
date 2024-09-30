import { debounce } from 'lodash';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getCurrentDraftTransaction,
  updateMultisignGasRate,
} from '../../../../ducks/send';
import { GasMultisignSliderInner } from './gas-multisign-slider-inner';

export const GasMultisignSlider = () => {
  const dispatch = useDispatch();
  const draft = useSelector(getCurrentDraftTransaction);

  const { gas = {} } = draft;

  // const handleChange = debounce((v) => {
  //   console.log('handleChange', v);
  //   dispatch(updateMultisignGasRate(v));
  // }, 100);

  const handleChange = useCallback(
    (v) => {
      dispatch(updateMultisignGasRate(v));
    },
    [dispatch],
  );

  return <GasMultisignSliderInner value={gas.rate} onChange={handleChange} />;
};
