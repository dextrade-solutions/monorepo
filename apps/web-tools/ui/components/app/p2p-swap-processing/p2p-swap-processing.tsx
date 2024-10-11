import './index.scss';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import {
  formatCurrency,
  formatFundsAmount,
  P2P_STAGES,
  TRADE_ACTIVE_STATUSES,
  TradeStatus,
  TradeType,
} from 'dex-helpers';
import { AssetModel, Trade } from 'dex-helpers/types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AllowanceStage from './stage-allowance';
import { StageClaim } from './stage-claim';
import StageDirectTransfer from './stage-direct-transfer';
import StageInitiateSafe from './stage-initiate-safe';
import SwapFailtureIcon from './swap-failure-icon';
import SwapSuccessIcon from './swap-success-icon';
import SwapTimeoutIcon from './swap-timeout-icon';
import { MINUTE } from '../../../../app/constants/time';
import { determineTradeType } from '../../../../app/helpers/utils';
import P2PService from '../../../../app/services/p2p-service';
import { SWAPS_HISTORY_ROUTE } from '../../../helpers/constants/routes';
import { useAtomicSwap } from '../../../hooks/useAtomicSwap';
import { useI18nContext } from '../../../hooks/useI18nContext';
import AssetItem from '../../ui/asset-item';
import P2PChat from '../p2p-chat';
import { StageStatuses } from './stage-statuses';
import { CountdownTimer, Icon, PaymentMethodDisplay, PulseLoader, StepProgressBar } from 'dex-ui';

interface IProps {
  exchange: Trade;
  from: AssetModel;
  to: AssetModel;
}

export const P2PSwapProcessing = ({ exchange, from, to }: IProps) => {
  const t = useI18nContext();
  const navigate = useNavigate();
  const [stagesStatuses, setStagesStatuses] = useState({
    allowance: null,
    safeInit: null,
    safeClaim: null,
    directTransfer: null,
  });
  const { safe2, initiateNewSwap, claimSwap } = useAtomicSwap(
    exchange,
    from,
    to,
  );
  const [incomingPaymentApproved, setIncomingPaymentApproved] = useState(false);
  const [outgoingPaymentApproved, setOutgoingPaymentApproved] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const pairType = determineTradeType(exchange);
  const isTradeStarted =
    TRADE_ACTIVE_STATUSES.includes(exchange.status) &&
    exchange.status !== TradeStatus.waitExchangerVerify;

  const stages: { component: React.ReactNode; key: string }[] = [];
  let content;
  let headerText;
  let statusImage;
  let submitText;

  if (isTradeStarted) {
    if (pairType === TradeType.atomicSwap) {
      if (!from.isNative) {
        stages.push({
          component: (
            <AllowanceStage
              key="allowance"
              trade={exchange}
              from={from}
              value={stagesStatuses.allowance}
              onChange={(newStatus: StageStatuses) =>
                setStagesStatuses((v) => ({ ...v, allowance: newStatus }))
              }
            />
          ),
          key: 'allowance',
        });
      }
      stages.push({
        component: (
          <StageInitiateSafe
            key="safeInit"
            trade={exchange}
            from={from}
            initiateNewSwap={initiateNewSwap}
            value={stagesStatuses.safeInit}
            onChange={(newStatus: StageStatuses) =>
              setStagesStatuses((v) => ({ ...v, safeInit: newStatus }))
            }
          />
        ),
        key: 'safeInit',
      });
      stages.push({
        component: (
          <StageClaim
            key="safeClaim"
            safe2={safe2}
            trade={exchange}
            claimSwap={claimSwap}
            value={stagesStatuses.safeClaim}
            onChange={(newStatus: StageStatuses) =>
              setStagesStatuses((v) => ({ ...v, safeClaim: newStatus }))
            }
          />
        ),
        key: 'safeClaim',
      });
    } else if (!from.isFiat) {
      stages.push({
        component: (
          <StageDirectTransfer
            key="directTransfer"
            from={from}
            trade={exchange}
            value={stagesStatuses.directTransfer}
            onChange={(newStatus: StageStatuses) =>
              setStagesStatuses((v) => ({ ...v, directTransfer: newStatus }))
            }
          />
        ),
        key: 'directTransfer',
      });
    }
  }

  if (!exchange) {
    return (
      <Typography textAlign="center" marginY={2} variant="h6">
        Swap not found...
      </Typography>
    );
  }
  submitText = t('viewAllTrades');

  if (exchange.status === TradeStatus.canceled) {
    statusImage = <SwapFailtureIcon />;
    headerText = t('Swap Canceled');
    content = (
      <Alert severity="error">The swap was canceled by the exchanger</Alert>
    );
  } else if (exchange.status === TradeStatus.new && from.isFiat) {
    statusImage = <PulseLoader />;
    headerText = t('Swap Processing');
    let approveDeadline = 15 * MINUTE;
    const historyRow = exchange.statusHistory.find(
      ({ status }) => status === TradeStatus.new,
    );
    if (historyRow && exchange.exchangerSettings.timeToPay) {
      approveDeadline = exchange.exchangerSettings.timeToPay;
    }

    content = (
      <Box>
        {outgoingPaymentApproved ? (
          <Alert>You are confirmed {from.symbol} transfer</Alert>
        ) : (
          <>
            <Alert severity="info">
              Please, send{' '}
              <strong>{`${exchange.amount1} ${from.symbol}`}</strong> using your
              bank account and press the confirm button
            </Alert>
            <Box marginTop={3}>
              <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
                <CardContent>
                  <PaymentMethodDisplay
                    title="Exchanger Payment Method"
                    paymentMethod={exchange.exchangerPaymentMethod}
                    expanded
                  />
                </CardContent>
              </Card>
            </Box>
            <Box
              display="flex"
              marginY={4}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography>
                <CountdownTimer
                  timeStarted={historyRow?.cdt}
                  timerBase={approveDeadline}
                  labelKey="approvalTimerP2PLabel"
                  infoTooltipLabelKey="approvalTimerP2PInfo"
                  warningTime="1:00"
                />
              </Typography>
              <Button
                onClick={async () => {
                  await P2PService.exchangeApprove(true, {
                    id: exchange.id,
                  });
                  setOutgoingPaymentApproved(true);
                }}
                variant="contained"
              >
                Confirm payment
              </Button>
            </Box>
          </>
        )}
      </Box>
    );
  } else if (exchange.status === TradeStatus.waitExchangerVerify) {
    statusImage = <PulseLoader />;
    headerText = t('Reservation');
    content = (
      <Alert severity="info">
        If exchanger is not responding, you can cancel the exchange
      </Alert>
    );
    submitText = t('cancel');
  } else if (exchange.status === TradeStatus.clientTransactionVerify) {
    statusImage = <PulseLoader />;
    headerText = t('Client transaction sending');
  } else if (exchange.status === TradeStatus.exchangerTransactionVerify) {
    statusImage = <PulseLoader />;
    headerText = t('Swap Processing');
    if (to.isFiat) {
      content = (
        <Box>
          {incomingPaymentApproved ? (
            <Alert>You are confirmed the payment</Alert>
          ) : (
            <>
              <Box marginBottom={2}>
                <Alert severity="info">
                  The exchanger has confirmed the payment. Please approve that
                  the{' '}
                  <strong>
                    {exchange.amount2} {exchange.exchangerSettings.to.ticker}
                  </strong>{' '}
                  has been transferred.
                </Alert>
              </Box>
              <Box display="flex" justifyContent="space-between" margin={3}>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    await P2PService.confirmExchangeFiat(exchange.id);
                    setIncomingPaymentApproved(true);
                  }}
                >
                  Dispute
                </Button>
                <Button
                  variant="contained"
                  onClick={async () => {
                    await P2PService.confirmExchangeFiat(exchange.id);
                    setIncomingPaymentApproved(true);
                  }}
                >
                  Confirm payment
                </Button>
              </Box>
            </>
          )}
        </Box>
      );
    }
  } else if (exchange.status === TradeStatus.completed) {
    statusImage = <SwapSuccessIcon />;
    headerText = t('Completed');
  } else if (exchange.status === TradeStatus.expired) {
    statusImage = <SwapTimeoutIcon />;
    headerText = t('Expired');
  } else {
    statusImage = <PulseLoader />;
    headerText = t('Swap Processing');
  }

  const onSubmit = async () => {
    if (exchange.status === TradeStatus.waitExchangerVerify) {
      try {
        setCancelLoading(true);
        await P2PService.cancelExchange(exchange.id);
      } catch {
        setCancelLoading(false);
      }
    }
    navigate(SWAPS_HISTORY_ROUTE);
  };

  return (
    <Box
      className="swap-processing"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <div className="flex-grow" />
      <Typography variant="h4" marginBottom={4}>
        {headerText}
      </Typography>
      <div className="status-icon">{statusImage}</div>
      <Box
        marginY={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
      >
        <Card
          className="swap-processing__asset-info"
          variant="outlined"
          sx={{
            bgcolor: 'transparent',
            width: {
              xs: '100%',
              sm: 200,
            },
          }}
        >
          <CardContent>
            <AssetItem coin={exchange.exchangerSettings.from} />
          </CardContent>
          <CardContent>
            <Typography>
              {formatFundsAmount(
                exchange.amount1,
                exchange.exchangerSettings.from.ticker,
              )}{' '}
            </Typography>
            <Typography color="text.secondary">
              {formatCurrency(
                exchange.amount1 *
                  exchange.exchangerSettings.coinPair.priceCoin1InUsdt,
                'usd',
              )}
            </Typography>
          </CardContent>
        </Card>
        <Box marginX={2}>
          <Icon name="exchange-direction" size="xl" />
        </Box>
        <Card
          className="swap-processing__asset-info"
          variant="outlined"
          sx={{
            bgcolor: 'transparent',
            width: {
              xs: '100%',
              sm: 200,
            },
          }}
        >
          <CardContent>
            <AssetItem coin={exchange.exchangerSettings.to} />
          </CardContent>
          <CardContent>
            <Typography>
              {formatFundsAmount(
                exchange.amount2,
                exchange.exchangerSettings.to.ticker,
              )}{' '}
            </Typography>
            <Typography color="text.secondary">
              {formatCurrency(
                exchange.amount2 *
                  exchange.exchangerSettings.coinPair.priceCoin2InUsdt,
                'usd',
              )}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box width="100%">
        <StepProgressBar
          stages={P2P_STAGES.filter(({ pairTypes }) =>
            pairTypes.includes(pairType),
          )}
          value={{ trade: exchange }}
        />
        {content && <Box marginY={4}>{content}</Box>}
        <Box marginTop={3}>
          {stages
            .filter(
              (_, idx, arr) =>
                idx === 0 ||
                stagesStatuses[arr[idx - 1].key] === StageStatuses.success,
            )
            .map(({ component }) => component)}
        </Box>
      </Box>
      {exchange.exchangerSettings.provider !== 'DEXPAY' && (
        <Box width="100%" marginY={2}>
          <P2PChat
            variant="outlined"
            trade={exchange}
            sx={{ bgcolor: 'transparent' }}
          />
        </Box>
      )}
      <div className="flex-grow" />
      <Button
        fullWidth
        onClick={onSubmit}
        disabled={isTradeStarted || cancelLoading}
      >
        {submitText}
      </Button>
    </Box>
  );
};
