import React from 'react';
import { useSelector } from 'react-redux';
import { getExchanger } from '../../../selectors';
import ExchangerForm from './exchanger-form';

export default function ExchangerSettings() {
  const exchanger = useSelector(getExchanger);
  return <ExchangerForm wrapPageContainer exchanger={exchanger} />;
}
