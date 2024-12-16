import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import {
  NetworkNames,
  P2P_STAGES,
  TradeType,
  formatCurrency,
  formatDate,
  formatFundsAmount,
  getBlockExplorerLink,
} from 'dex-helpers';
import { Trade } from 'dex-helpers/types';
import { CopyData, StepProgressBar, CountdownTimer } from 'dex-ui';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { createSearchParams, useNavigate } from 'react-router-dom';

import { SECOND } from '../../../../../app/constants/time';
import { parseCoin } from '../../../../../app/helpers/p2p';
import { determineTradeType } from '../../../../../app/helpers/utils';
import { showModal } from '../../../../ducks/app/app';
import {
  AWAITING_SWAP_ROUTE,
  EXCHANGE_VIEW_ROUTE,
} from '../../../../helpers/constants/routes';
import withModalProps from '../../../../helpers/hoc/with-modal-props';
import { useAtomicSwap } from '../../../../hooks/useAtomicSwap';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import P2PDisplayStatus from '../../p2p-display-status';
import { ModalProps } from '../types';

const TradeHistoryRowModal = ({
  trade,
  hideModal,
}: {
  trade: Trade;
} & ModalProps) => {
  const navigate = useNavigate();
  const t = useI18nContext();
  const pairType = determineTradeType(trade);
  const dispatch = useDispatch();

  const from = useMemo(
    () =>
      trade &&
      parseCoin(
        trade.exchangerSettings.from,
        trade.exchangerSettings.coinPair.priceCoin1InUsdt,
      ),
    [trade],
  );
  const to = useMemo(
    () =>
      trade &&
      parseCoin(
        trade.exchangerSettings.to,
        trade.exchangerSettings.coinPair.priceCoin2InUsdt,
      ),
    [trade],
  );

  const { safe2, safe1, claimSwapUsingWallet, refundSwap } = useAtomicSwap(
    trade,
    from,
    to,
  );
  const canClaimSwap =
    pairType === TradeType.atomicSwap &&
    safe2 &&
    !safe2?.claimed &&
    !safe2.refunded;

  const canRefundSwap =
    pairType === TradeType.atomicSwap &&
    safe1 &&
    !safe1.claimed &&
    !safe1.refunded &&
    !safe2?.claimed;

  const handleBlockExplorerClick = (hash: string, network: NetworkNames) => {
    const blockExplorerLink = getBlockExplorerLink({
      hash,
      network,
    });
    window.open(blockExplorerLink);
  };

  const openAd = () => {
    navigate({
      pathname: EXCHANGE_VIEW_ROUTE,
      search: `?${createSearchParams({
        fromNetworkName: trade.exchangerSettings.from.networkName,
        fromTicker: trade.exchangerSettings.from.ticker,
        toNetworkName: trade.exchangerSettings.to.networkName,
        toTicker: trade.exchangerSettings.to.ticker,
        name: trade.exchangerName,
      })}`,
    });
    hideModal();
  };

  const openTrade = () => {
    navigate(`${AWAITING_SWAP_ROUTE}/${trade.id}`);
    hideModal();
  };

  const expirationTimestamp = parseInt(safe1?.expiration, 10) * SECOND;

  const refundExpiration = expirationTimestamp - new Date().getTime();

  return (
    <Box padding={2}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Typography color="text.secondary">{formatDate(trade.cdt)}</Typography>
        <P2PDisplayStatus status={trade.status} />
      </Box>
      <Box>
        <Box display="flex" textAlign="right" alignItems="center">
          <Typography textAlign="left" className="flex-grow nowrap">
            Provider
          </Typography>
          <CopyData className="flex-shrink" data={trade?.exchangerName || ''} />
        </Box>
        <Box display="flex" textAlign="right" alignItems="center">
          <Typography textAlign="left" className="flex-grow nowrap">
            Swap ID
          </Typography>
          <CopyData shorten className="flex-shrink" data={trade?.id || ''} />
        </Box>
        <Box display="flex" marginTop={1}>
          <Typography className="flex-grow">{t('transactionFee')}</Typography>
          <Typography>
            {trade.transactionFee
              ? formatFundsAmount(
                  trade.transactionFee,
                  trade.exchangerSettings.to.ticker,
                )
              : t('auto')}
          </Typography>
        </Box>
      </Box>
      <Box paddingY={3}>
        <StepProgressBar
          stages={P2P_STAGES.filter(({ pairTypes }) =>
            pairTypes.includes(pairType),
          )}
          value={{ trade, swapClaimed: safe2?.claimed }}
        />
      </Box>
      <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
        <CardContent>
          <Typography display="flex">
            <strong className="flex-grow">{t('youGive')}</strong>
            <Typography>
              {formatFundsAmount(
                trade.amount1,
                trade.exchangerSettings.from.ticker,
              )}
            </Typography>
            <Typography color="text.secondary" marginLeft={1}>
              {formatCurrency(
                trade.amount1 *
                  trade.exchangerSettings.coinPair.priceCoin1InUsdt,
                'usd',
              )}
            </Typography>
          </Typography>

          {trade.clientTransactionHash && (
            <>
              <Box
                marginTop={3}
                display="flex"
                textAlign="right"
                alignItems="center"
              >
                <Typography textAlign="left" className="flex-grow nowrap">
                  Hash
                </Typography>
                <CopyData
                  className="flex-shrink"
                  data={trade.clientTransactionHash}
                />
              </Box>
              <Box display="flex" justifyContent="flex-end">
                <Box>
                  <Button
                    onClick={() =>
                      handleBlockExplorerClick(
                        trade.clientTransactionHash,
                        trade.exchangerSettings.from.networkName,
                      )
                    }
                  >
                    {t('viewOnBlockExplorer')}
                  </Button>
                </Box>
              </Box>
            </>
          )}

          {safe1 && safe1.refunded && (
            <Alert severity="success">
              You refunded{' '}
              {formatFundsAmount(
                trade.amount1,
                trade.exchangerSettings.from.ticker,
              )}
            </Alert>
          )}

          {canRefundSwap && (
            <Box>
              {refundExpiration > 0 ? (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  marginTop={2}
                >
                  <CountdownTimer
                    timeStarted={expirationTimestamp}
                    timerBase={refundExpiration}
                    labelKey="approveRefundAfterTimeLock"
                    infoTooltipLabelKey="approvalTimerP2PInfo"
                  />
                  <Button variant="contained" size="small" disabled>
                    Refund
                  </Button>
                </Box>
              ) : (
                <Alert
                  severity="info"
                  action={
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        refundSwap({
                          onSuccess: (txHash: string) => {
                            dispatch(
                              showModal({
                                name: 'ALERT_MODAL',
                                text: `Swap successfully refunded with tx hash - ${txHash}`,
                              }),
                            );
                          },
                          onError: (e: unknown) => {
                            dispatch(
                              showModal({
                                name: 'ALERT_MODAL',
                                text: e.shortMessage,
                              }),
                            );
                          },
                        })
                      }
                    >
                      Refund
                    </Button>
                  }
                >
                  Approve refund
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
      <Box marginY={2} />
      <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
        <CardContent>
          <Typography display="flex" justifyContent="space-between">
            <Box display="flex">
              <strong className="flex-grow">{t('youGet')}</strong>
              <Typography marginLeft={1} color="text.secondary">
                Plan
              </Typography>
            </Box>
            <Box display="flex">
              <Typography>
                {formatFundsAmount(
                  trade.amount2,
                  trade.exchangerSettings.to.ticker,
                )}
              </Typography>
              <Typography color="text.secondary" marginLeft={1}>
                {formatCurrency(
                  trade.amount2 *
                    trade.exchangerSettings.coinPair.priceCoin2InUsdt,
                  'usd',
                )}
              </Typography>
            </Box>
          </Typography>
          {trade.exchangerSentAmount && (
            <Typography display="flex" justifyContent="space-between">
              <Box display="flex">
                <strong className="flex-grow">{t('youGet')}</strong>
                <Typography marginLeft={1} color="text.secondary">
                  Fact
                </Typography>
              </Box>
              <Box display="flex">
                <Typography>
                  {formatFundsAmount(
                    trade.exchangerSentAmount,
                    trade.exchangerSettings.to.ticker,
                  )}
                </Typography>
                <Typography color="text.secondary" marginLeft={1}>
                  {formatCurrency(
                    trade.exchangerSentAmount *
                      trade.exchangerSettings.coinPair.priceCoin2InUsdt,
                    'usd',
                  )}
                </Typography>
              </Box>
            </Typography>
          )}

          {trade.exchangerTransactionHash && (
            <>
              <Box
                display="flex"
                marginTop={3}
                textAlign="right"
                alignItems="center"
              >
                <Typography textAlign="left" className="flex-grow nowrap">
                  Hash
                </Typography>
                <CopyData
                  className="flex-shrink"
                  data={trade.exchangerTransactionHash}
                />
              </Box>
              <Box display="flex" justifyContent="flex-end">
                <Box>
                  <Button
                    onClick={() =>
                      handleBlockExplorerClick(
                        trade.exchangerTransactionHash,
                        trade.exchangerSettings.to.networkName,
                      )
                    }
                  >
                    {t('viewOnBlockExplorer')}
                  </Button>
                </Box>
              </Box>
            </>
          )}
          {canClaimSwap && (
            <Alert
              severity="info"
              action={
                <Button
                  variant="contained"
                  size="small"
                  onClick={() =>
                    claimSwapUsingWallet({
                      onSuccess: (txHash: string) => {
                        dispatch(
                          showModal({
                            name: 'ALERT_MODAL',
                            text: `Swap successfully claimed with tx hash - ${txHash}`,
                          }),
                        );
                      },
                      onError: (e: unknown) => {
                        dispatch(
                          showModal({
                            name: 'ALERT_MODAL',
                            text: e.shortMessage,
                          }),
                        );
                      },
                    })
                  }
                >
                  Claim
                </Button>
              }
            >
              Approve claim in your wallet
            </Alert>
          )}
          {safe2 && safe2.refunded && (
            <Alert severity="error">
              Exchanger refunded{' '}
              {formatFundsAmount(
                trade.amount2,
                trade.exchangerSettings.to.ticker,
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
      <Box marginTop={2}>
        <Button onClick={openAd} variant="outlined" fullWidth>
          Try again
        </Button>
      </Box>
      <Box marginTop={1}>
        <Button fullWidth onClick={openTrade}>
          View swap
        </Button>
      </Box>
    </Box>
  );
};

const TradeHistoryRowModalComponent = withModalProps(TradeHistoryRowModal);

export default TradeHistoryRowModalComponent;
