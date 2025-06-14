import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Collapse,
  IconButton,
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
import {
  useGlobalModalContext,
  CopyData,
  StepProgressBar,
  CountdownTimer,
  ModalProps,
  Icon,
} from 'dex-ui';
import { Duration } from 'luxon';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SECOND } from '../../../../../app/constants/time';
import { getAdPathname, parseCoin } from '../../../../../app/helpers/p2p';
import { determineTradeType } from '../../../../../app/helpers/utils';
import { AWAITING_SWAP_ROUTE } from '../../../../helpers/constants/routes';
import { useAtomicSwap } from '../../../../hooks/useAtomicSwap';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import P2PDisplayStatus from '../../p2p-display-status';

const TradeHistoryRowModal = ({
  trade,
  hideModal,
}: {
  trade: Trade;
} & ModalProps) => {
  const { showModal } = useGlobalModalContext();
  const navigate = useNavigate();
  const t = useI18nContext();
  const pairType = determineTradeType(trade);
  const [showDetails, setShowDetails] = useState(false);

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
      pathname: getAdPathname({
        fromNetworkName: trade.exchangerSettings.from.networkName,
        fromTicker: trade.exchangerSettings.from.ticker,
        toNetworkName: trade.exchangerSettings.to.networkName,
        toTicker: trade.exchangerSettings.to.ticker,
        name: trade.exchangerName,
      }),
    });
    hideModal();
  };

  const openTrade = () => {
    navigate(`${AWAITING_SWAP_ROUTE}/${trade.id}`);
    hideModal();
  };

  const expirationTimestamp = parseInt(safe1?.expiration, 10) * SECOND;
  const refundExpiration = expirationTimestamp - new Date().getTime();

  const tradeDuration = useMemo(() => {
    if (!trade.statusHistory?.length) {
      return null;
    }

    const sortedHistory = [...trade.statusHistory].sort(
      (a, b) => a.cdt - b.cdt,
    );
    const startTime = sortedHistory[0].cdt;
    const endTime = sortedHistory[sortedHistory.length - 1].cdt;
    const durationMs = endTime - startTime;

    const duration = Duration.fromMillis(durationMs);
    return duration.toFormat('m:ss');
  }, [trade.statusHistory]);

  return (
    <Box padding={2}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Box>
          <Typography color="text.secondary">
            {formatDate(trade.cdt)}
          </Typography>
        </Box>
        <P2PDisplayStatus status={trade.status} />
      </Box>
      <Box>
        <Box display="flex" textAlign="right" alignItems="center">
          <Typography textAlign="left" className="flex-grow nowrap">
            {t('provider')}
          </Typography>
          <CopyData data={trade?.exchangerName || ''} />
        </Box>
      </Box>
      <Box paddingY={1}>
        {tradeDuration && (
          <Box
            display="flex"
            alignItems="center"
            mb={2}
            sx={{
              justifyContent: 'center',
              textAlign: 'center',
              backgroundColor: 'primary.light',
              padding: '6px',
              borderRadius: 1,
            }}
          >
            <Icon name="clock" color="text.secondary" size="sm" />
            <Typography
              color="text.secondary"
              variant="body2"
              marginLeft={1}
              fontWeight="medium"
            >
              {t('Duration')}: {tradeDuration}
            </Typography>
          </Box>
        )}
        <StepProgressBar
          stages={P2P_STAGES.filter(({ pairTypes }) =>
            pairTypes.includes(pairType),
          )}
          value={{ trade, swapClaimed: safe2?.claimed }}
        />
      </Box>
      <Box display="flex" justifyContent="center" mb={2}>
        <Button
          variant="text"
          onClick={() => setShowDetails(!showDetails)}
          disabled={showDetails}
          endIcon={
            <Icon
              name={showDetails ? 'chevron-up' : 'chevron-down'}
              size="sm"
            />
          }
        >
          {t(showDetails ? 'Hide Details' : 'Show Details')}
        </Button>
      </Box>
      <Collapse in={showDetails}>
        <Box mb={2}>
          <Box display="flex" textAlign="right" alignItems="center">
            <Typography textAlign="left" className="flex-grow nowrap">
              {t('Swap ID')}
            </Typography>
            <CopyData width="100%" data={trade?.id || ''} />
          </Box>

          <Box display="flex" marginTop={1}>
            <Typography className="flex-grow">{t('transactionFee')}</Typography>
            <Typography>
              {trade.exchangerSettings.transactionFeeFixedValue &&
                formatFundsAmount(
                  trade.exchangerSettings.transactionFeeFixedValue,
                  trade.exchangerSettings.to.ticker,
                )}
            </Typography>
            <Typography ml={1}>
              {trade.exchangerSettings.transactionFeeType}
            </Typography>
          </Box>
        </Box>
      </Collapse>
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
                  {t('Hash')}
                </Typography>
                <CopyData data={trade.clientTransactionHash} />
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
              {t('You refunded')}
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
                    {t('Refund')}
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
                            showModal({
                              name: 'ALERT_MODAL',
                              text: `Swap successfully refunded with tx hash - ${txHash}`,
                            });
                          },
                          onError: (e: unknown) => {
                            showModal({
                              name: 'ALERT_MODAL',
                              text: e.shortMessage,
                            });
                          },
                        })
                      }
                    >
                      {t('Refund')}
                    </Button>
                  }
                >
                  {t('Approve refund')}
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
                {t('Plan')}
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
                  {t('Fact')}
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
                  {t('Hash')}
                </Typography>
                <CopyData data={trade.exchangerTransactionHash} />
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
                        showModal({
                          name: 'ALERT_MODAL',
                          text: `Swap successfully claimed with tx hash - ${txHash}`,
                        });
                      },
                      onError: (e: unknown) => {
                        showModal({
                          name: 'ALERT_MODAL',
                          text: e.shortMessage,
                        });
                      },
                    })
                  }
                >
                  {t('Claim')}
                </Button>
              }
            >
              {t('Approve claim in your wallet')}
            </Alert>
          )}
          {safe2 && safe2.refunded && (
            <Alert severity="error">
              {t('Exchanger refunded')}
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
          {t('Try again')}
        </Button>
      </Box>
      <Box marginTop={1}>
        <Button fullWidth onClick={openTrade}>
          {t('View swap')}
        </Button>
      </Box>
    </Box>
  );
};

export default TradeHistoryRowModal;
