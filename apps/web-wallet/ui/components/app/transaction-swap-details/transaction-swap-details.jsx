import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ExchangerType } from '../../../../shared/constants/exchanger';
import { DISPLAY } from '../../../helpers/constants/design-system';
import { AWAITING_SWAP_ROUTE } from '../../../helpers/constants/routes';
import { PENDING_STATUS_HASH } from '../../../helpers/constants/transactions';
import { formatDate } from '../../../helpers/utils/util';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  setBackgroundSwapRouteState,
  setTradeTxId,
} from '../../../store/actions';
import { Text } from '../../component-library';
import Box from '../../ui/box';
import Button from '../../ui/button';
import TransactionStatusLabel from '../transaction-status-label/transaction-status-label';
import TransactionSwapDEXDetails from './transaction-swap-dex-details';
import TransactionSwapP2PDetails from './transaction-swap-p2p-details';

export default function TransactionSwapDetails(props) {
  const { txData = {} } = props;
  const { time, id, exchangerType, err, status } = txData;
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();

  const date = useMemo(() => formatDate(time), [time]);

  const RenderDetailsComponent = useMemo(() => {
    switch (exchangerType) {
      case ExchangerType.P2PExchanger:
      case ExchangerType.P2PClient:
        return TransactionSwapP2PDetails;
      case ExchangerType.OTC:
      case ExchangerType.DEX:
        return TransactionSwapDEXDetails;
      default:
        return <div>Implement default swap details render</div>;
    }
  }, [exchangerType]);

  const openDetailView = useCallback(async () => {
    await dispatch(setBackgroundSwapRouteState('awaiting'));
    await dispatch(setTradeTxId(id));
    history.push(AWAITING_SWAP_ROUTE);
  }, [dispatch, history, id]);

  return (
    <Box marginLeft={4} marginRight={4}>
      <Box paddingBottom={3} paddingLeft={3} paddingRight={3}>
        <Text display={DISPLAY.FLEX}>
          <span className="flex-grow" />
          <span>{date}</span>
        </Text>
        <Text marginBottom={5} display={DISPLAY.FLEX}>
          <strong className="flex-grow">{t('status')}</strong>
          <TransactionStatusLabel
            isPending={txData.status in PENDING_STATUS_HASH}
            error={err}
            date={date}
            status={status}
            statusOnly
          />
        </Text>
      </Box>

      <RenderDetailsComponent {...props} />

      <Box marginBottom={3}>
        <Button onClick={openDetailView}>Show swap</Button>
      </Box>
    </Box>
  );
}

TransactionSwapDetails.propTypes = {
  txData: PropTypes.object.isRequired,
};
