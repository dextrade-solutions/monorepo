import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  exchangerRepeatExchange,
  exchangerSetActive,
} from '../../../store/actions';
import { formatCurrency } from '../../../helpers/utils/confirm-tx.util';
import { getCurrentCurrency, getExchanger } from '../../../selectors';

export const ExchangerWrap = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const currentCurrency = useSelector(getCurrentCurrency);
  const exchanger = useSelector(getExchanger) || {
    exchangerSettings: [],
    userInfo: {},
  };

  const setActive = useCallback(
    async (isActive) => {
      setLoading(true);
      await dispatch(exchangerSetActive(isActive));
      setLoading(false);
    },
    [dispatch],
  );

  const repeatExchange = useCallback(
    (exchangeResponseData) => {
      dispatch(exchangerRepeatExchange(exchangeResponseData));
    },
    [dispatch],
  );

  // if (!exchanger) {
  //   return <Redirect to={{ pathname: EXCHANGER_CREATE_ROUTE }} />;
  // }

  const totalIncome = exchanger.exchangerSettings.reduce((acc, setting) => {
    return acc + (setting.statistic?.amountInUsdt || 0);
  }, 0);

  const formattedTotalIncome = formatCurrency(totalIncome, currentCurrency);

  return children({
    exchanger,
    formattedTotalIncome,
    setActive,
    repeatExchange,
    loading,
  });
};

ExchangerWrap.propTypes = {
  children: PropTypes.node.isRequired,
};
