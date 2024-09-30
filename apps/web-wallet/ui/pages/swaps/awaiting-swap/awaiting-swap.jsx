import React, { useContext, useState, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import isEqual from 'lodash/isEqual';
import { I18nContext } from '../../../contexts/i18n';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { EVENT } from '../../../../shared/constants/metametrics';

import {
  getCurrentChainId,
  getCurrentCurrency,
  getUSDConversionRate,
  isHardwareWallet,
  getHardwareWalletType,
} from '../../../selectors';

import {
  getUsedQuote,
  getFetchParams,
  getApproveTxParams,
  getUsedSwapsGasPrice,
  fetchQuotesAndSetQuoteState,
  navigateBackToBuildQuote,
  prepareForRetryGetQuotes,
  prepareToLeaveSwaps,
  getSmartTransactionsOptInStatus,
  getSmartTransactionsEnabled,
  getCurrentSmartTransactionsEnabled,
  getFromTokenInputValue,
  getMaxSlippage,
  clientP2PCancelTransaction,
  clientP2PConfirmTransaction,
  getIncomingPaymentApproved,
} from '../../../ducks/swaps/swaps';
import {
  QUOTES_EXPIRED_ERROR,
  SWAP_FAILED_ERROR,
  ERROR_FETCHING_QUOTES,
  QUOTES_NOT_AVAILABLE_ERROR,
  CONTRACT_DATA_DISABLED_ERROR,
  OFFLINE_FOR_MAINTENANCE,
  EXPIRED_ERROR,
} from '../../../../shared/constants/swaps';
import { isSwapsDefaultTokenSymbol } from '../../../../shared/modules/swaps.utils';
import PulseLoader from '../../../components/ui/pulse-loader';

import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import {
  stopPollingForQuotes,
  setDefaultHomeActiveTabName,
  updateAndApproveP2PTransaction,
  cancelTx,
  getAssetModel,
} from '../../../store/actions';

import { getRenderableNetworkFeesForQuote } from '../swaps.util';
import SwapsFooter from '../swaps-footer';

import CreateNewSwap from '../create-new-swap';
import ViewOnBlockExplorer from '../view-on-block-explorer';
import Box from '../../../components/ui/box/box';
import { Button, Text } from '../../../components/component-library';
import {
  TransactionStatus,
  TransactionType,
} from '../../../../shared/constants/transaction';
import Asset from '../../../components/ui/asset';
import PaymentMethodDisplay from '../../../components/ui/payment-method-display';
import CountdownTimer from '../countdown-timer';
import {
  ExchangeP2PStatus,
  ExchangerType,
} from '../../../../shared/constants/exchanger';
import StepProgressBarNew from '../../../components/app/step-progress-bar-new';
import { P2P_STAGES } from '../../../components/app/step-progress-bar-new/stages';
import { TextVariant } from '../../../helpers/constants/design-system';
import P2PChat from '../../../components/app/p2p-chat';
import SwapFailureIcon from './swap-failure-icon';
import SwapSuccessIcon from './swap-success-icon';
import QuotesTimeoutIcon from './quotes-timeout-icon';

export default function AwaitingSwap({
  swapComplete,
  errorKey,
  submittingSwap,
  transaction,
  hideFooter = false,
  onSubmit = null,
  onSwapNew = null,
}) {
  const t = useContext(I18nContext);
  const trackEvent = useContext(MetaMetricsContext);
  const history = useHistory();
  const dispatch = useDispatch();
  const {
    id: txId,
    swapMetaData = {},
    time,
    pairType,
    exchangerSettings,
    source,
    destination,
    approveDeadline,
    status,
    hash,
    receiveHash,
    type,
    txParams: { localId } = {},
  } = transaction || {};
  const fetchParams = useSelector(getFetchParams, isEqual);
  const fromTokenInputValue = useSelector(getFromTokenInputValue);
  const maxSlippage = useSelector(getMaxSlippage);
  const usedQuote = useSelector(getUsedQuote, isEqual);
  const approveTxParams = useSelector(getApproveTxParams, shallowEqual);
  const swapsGasPrice = useSelector(getUsedSwapsGasPrice);
  const currentCurrency = useSelector(getCurrentCurrency);
  const usdConversionRate = useSelector(getUSDConversionRate);
  const chainId = useSelector(getCurrentChainId);
  const incomingPaymentApproved = useSelector(getIncomingPaymentApproved);

  const [trackedQuotesExpiredEvent, setTrackedQuotesExpiredEvent] =
    useState(false);
  const [cooldownCancelation, setCooldownCancelation] = useState(10);

  let feeinUnformattedFiat;

  if (usedQuote && swapsGasPrice) {
    const renderableNetworkFees = getRenderableNetworkFeesForQuote({
      tradeGas: usedQuote.gasEstimateWithRefund || usedQuote.averageGas,
      approveGas: approveTxParams?.gas || '0x0',
      gasPrice: swapsGasPrice,
      currentCurrency,
      conversionRate: usdConversionRate,
      tradeValue: usedQuote?.trade?.value,
      sourceSymbol: swapMetaData?.token_from,
      sourceAmount: usedQuote.sourceAmount,
      chainId,
    });
    feeinUnformattedFiat = renderableNetworkFees.rawNetworkFees;
  }

  const hardwareWalletUsed = useSelector(isHardwareWallet);
  const hardwareWalletType = useSelector(getHardwareWalletType);
  const smartTransactionsOptInStatus = useSelector(
    getSmartTransactionsOptInStatus,
  );
  const smartTransactionsEnabled = useSelector(getSmartTransactionsEnabled);
  const currentSmartTransactionsEnabled = useSelector(
    getCurrentSmartTransactionsEnabled,
  );
  const sensitiveProperties = {
    token_from: swapMetaData?.token_from,
    token_from_amount: swapMetaData?.token_from_amount,
    token_to: swapMetaData?.token_to,
    request_type: fetchParams?.balanceError ? 'Quote' : 'Order',
    slippage: swapMetaData?.slippage,
    custom_slippage: swapMetaData?.slippage === 2,
    gas_fees: feeinUnformattedFiat,
    is_hardware_wallet: hardwareWalletUsed,
    hardware_wallet_type: hardwareWalletType,
    stx_enabled: smartTransactionsEnabled,
    current_stx_enabled: currentSmartTransactionsEnabled,
    stx_user_opt_in: smartTransactionsOptInStatus,
  };

  const isUnapproved = status === TransactionStatus.unapproved;
  const isSubmitted = status === TransactionStatus.submitted;
  const isApproval = [
    TransactionType.swapApproval,
    TransactionType.tokenMethodApprove,
    TransactionType.tokenMethodSetApprovalForAll,
  ].includes(type);

  const isP2PTx =
    transaction?.exchangerType in
    {
      [ExchangerType.P2PClient]: true,
      [ExchangerType.P2PExchanger]: true,
    };

  const waitExchangerVerify =
    transaction?.exchangerType === ExchangerType.P2PClient &&
    (!exchangerSettings?.status ||
      exchangerSettings?.status === ExchangeP2PStatus.waitExchangerVerify);

  let headerText;
  let statusImage;
  let descriptionText;
  let submitText;
  let content;

  let fromAsset = localId && dispatch(getAssetModel(localId));
  let toAsset;

  let disableSubmitting = submittingSwap;

  let submitButtonType = 'outline';

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldownCancelation((cooldown) => cooldown - 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const routeToActivity = async () => {
    await dispatch(setDefaultHomeActiveTabName('activity'));
    history.push(DEFAULT_ROUTE);
  };

  if (source && destination) {
    fromAsset = dispatch(getAssetModel(source));
    toAsset = dispatch(getAssetModel(destination));
  }

  if (errorKey === OFFLINE_FOR_MAINTENANCE) {
    headerText = t('offlineForMaintenance');
    descriptionText = t('metamaskSwapsOfflineDescription');
    submitText = t('close');
    statusImage = <SwapFailureIcon />;
  } else if (errorKey === SWAP_FAILED_ERROR) {
    headerText = t('swapFailedErrorTitle');
    descriptionText = t('swapFailedErrorDescriptionWithSupportLink');
    submitText = t('tryAgain');
    statusImage = <SwapFailureIcon />;
    submitButtonType = 'primary';
    // content = blockExplorerUrlFrom && (
    //   <ViewOnBlockExplorer
    //     blockExplorerUrl={blockExplorerUrlFrom}
    //     sensitiveTrackingProperties={sensitiveProperties}
    //   />
    // );
  } else if (errorKey === QUOTES_EXPIRED_ERROR) {
    headerText = t('swapQuotesExpiredErrorTitle');
    descriptionText = t('swapQuotesExpiredErrorDescription');
    submitText = t('tryAgain');
    statusImage = <QuotesTimeoutIcon />;
    submitButtonType = 'primary';

    if (!trackedQuotesExpiredEvent) {
      setTrackedQuotesExpiredEvent(true);
      trackEvent({
        event: 'Quotes Timed Out',
        category: EVENT.CATEGORIES.SWAPS,
        sensitiveProperties,
      });
    }
  } else if (errorKey === ERROR_FETCHING_QUOTES) {
    headerText = t('swapFetchingQuotesErrorTitle');
    descriptionText = t('swapFetchingQuotesErrorDescription');
    submitText = t('back');
    statusImage = <SwapFailureIcon />;
  } else if (errorKey === QUOTES_NOT_AVAILABLE_ERROR) {
    headerText = t('swapQuotesNotAvailableErrorTitle');
    descriptionText = t('swapQuotesNotAvailableErrorDescription');
    submitText = t('tryAgain');
    statusImage = <SwapFailureIcon />;
    submitButtonType = 'primary';
  } else if (errorKey === CONTRACT_DATA_DISABLED_ERROR) {
    headerText = t('swapContractDataDisabledErrorTitle');
    descriptionText = t('swapContractDataDisabledErrorDescription');
    submitText = t('tryAgain');
    statusImage = <SwapFailureIcon />;
    submitButtonType = 'primary';
  } else if (errorKey === EXPIRED_ERROR) {
    headerText = 'Exchange Expired';
    descriptionText = 'Please try again';
    submitText = t('back');
    statusImage = <SwapFailureIcon />;
  } else if (!errorKey && !swapComplete && waitExchangerVerify) {
    headerText = t('swapProcessing');
    descriptionText =
      'If exchanger is not responding, you can cancel the exchange';

    if (cooldownCancelation > 0) {
      submitText = `Wait ${cooldownCancelation} seconds`;
      disableSubmitting = true;
    } else {
      submitText = t('cancel');
    }
    statusImage = <PulseLoader />;
    submitButtonType = 'primary';
  } else if (!errorKey && !swapComplete && (!fromAsset || !toAsset)) {
    headerText = t('swapProcessing');
    statusImage = <PulseLoader />;
  } else if (!errorKey && !swapComplete && fromAsset && toAsset) {
    headerText = t('swapProcessing');
    statusImage = <PulseLoader />;
    if (isUnapproved) {
      submitText = t('cancel');
      submitButtonType = 'primary';
    } else {
      submitText = t('swapsViewInActivity');
    }
    descriptionText = t('swapOnceTransactionHasProcess', [
      <span
        key="swapOnceTransactionHasProcess-1"
        className="awaiting-swap__amount-and-symbol"
      >
        {swapMetaData?.token_to_amount} {toAsset.symbol}
      </span>,
    ]);
    content = (
      <Box paddingTop={6}>
        <span>{errorKey}</span>
        <Box className="swap-coin" padding={4} marginTop={6} marginBottom={6}>
          <Text>You give</Text>
          <Asset
            asset={fromAsset}
            marginBottom={3}
            amount={swapMetaData?.token_from_amount || 0}
          />
          {isSubmitted && (
            <Text>You are confirmed {fromAsset.symbol} transfer</Text>
          )}
          {!isSubmitted && fromAsset.isFiat && (
            <>
              <Text>
                Please, send{' '}
                <strong>{`${swapMetaData.token_from_amount} ${fromAsset.symbol}`}</strong>{' '}
                using your bank account and press the confirm button
              </Text>
              {exchangerSettings?.exchangerPaymentMethod && (
                <PaymentMethodDisplay
                  paymentMethod={exchangerSettings?.exchangerPaymentMethod}
                  marginTop={4}
                  expanded
                />
              )}
              {approveDeadline && (
                <>
                  <Text marginTop={4}>
                    <CountdownTimer
                      timeStarted={time}
                      timerBase={approveDeadline - time}
                      labelKey="approvalTimerP2PLabel"
                      infoTooltipLabelKey="approvalTimerP2PInfo"
                      warningTime="1:00"
                    />
                  </Text>
                  <Button
                    marginTop={4}
                    type="primary"
                    onClick={() => {
                      dispatch(updateAndApproveP2PTransaction(txId));
                    }}
                  >
                    Confirm payment
                  </Button>
                </>
              )}
            </>
          )}
          {hash && (
            <Text>
              <ViewOnBlockExplorer
                blockExplorerUrl={fromAsset.sharedProvider.getBlockExplorerLink(
                  hash,
                )}
              />
            </Text>
          )}
        </Box>
        <Box className="swap-coin" padding={4} marginTop={6} marginBottom={6}>
          <Text>Awaiting</Text>
          <Asset
            asset={toAsset}
            marginBottom={3}
            amount={swapMetaData?.token_to_amount || 0}
          />
          {receiveHash && (
            <Text>
              <ViewOnBlockExplorer
                blockExplorerUrl={toAsset.sharedProvider.getBlockExplorerLink(
                  receiveHash,
                )}
              />
            </Text>
          )}

          {toAsset.isFiat &&
            exchangerSettings?.status ===
              ExchangeP2PStatus.exchangerTransactionVerify && (
              <Box>
                <Text variant={TextVariant.bodyMd}>
                  The exchanger has made a payment. Please confirm that the
                  money has been transferred.
                </Text>
                <Button
                  marginTop={4}
                  type="primary"
                  disabled={incomingPaymentApproved}
                  onClick={() => {
                    dispatch(
                      clientP2PConfirmTransaction({
                        exchangeId: exchangerSettings.exchangeId,
                        txData: transaction,
                      }),
                    );
                  }}
                >
                  {incomingPaymentApproved
                    ? 'Payment approved'
                    : 'Confirm payment'}
                </Button>
              </Box>
            )}
        </Box>
      </Box>
    );
  } else if (!errorKey && swapComplete) {
    headerText = isApproval
      ? t('approvedOn', [`${fromAsset?.symbol} ${fromAsset?.standard}`])
      : t('swapTransactionComplete');
    statusImage = <SwapSuccessIcon />;
    submitText = t('close');
    submitButtonType = 'primary';
    descriptionText =
      !isApproval &&
      t('swapTokenAvailable', [
        <span
          key="swapTokenAvailable-2"
          className="awaiting-swap__amount-and-symbol"
        >
          {`${swapMetaData?.token_to_amout || ''} ${swapMetaData?.token_to}`}
        </span>,
      ]);
  }

  useEffect(() => {
    if (errorKey) {
      // If there was an error, stop polling for quotes.
      dispatch(stopPollingForQuotes());
    }
  }, [dispatch, errorKey]);

  return (
    <div className="awaiting-swap">
      <div className="awaiting-swap__content">
        <div className="awaiting-swap__status-image">{statusImage}</div>
        <div className="awaiting-swap__header">{headerText}</div>

        <div className="awaiting-swap__main-description">{descriptionText}</div>
        {isP2PTx && (
          <StepProgressBarNew
            marginTop={6}
            stages={P2P_STAGES.filter(({ pairTypes }) =>
              pairTypes.includes(pairType),
            )}
            value={exchangerSettings.status}
          />
        )}
        {content}
        {exchangerSettings && (
          <Box marginTop={2}>
            <P2PChat
              tradeId={exchangerSettings.exchangeId}
              userName={exchangerSettings.exchangerName}
            />
          </Box>
        )}
      </div>
      {!errorKey && swapComplete && !isApproval && (
        <CreateNewSwap onSubmit={onSwapNew} />
      )}
      {!hideFooter && (
        <SwapsFooter
          onSubmit={async () => {
            if (onSubmit) {
              onSubmit();
              return;
            }
            /* istanbul ignore next */
            if (!errorKey && isUnapproved) {
              await dispatch(cancelTx(transaction));
            }
            if (errorKey === OFFLINE_FOR_MAINTENANCE) {
              await dispatch(prepareToLeaveSwaps());
              history.push(DEFAULT_ROUTE);
            } else if (errorKey === QUOTES_EXPIRED_ERROR) {
              dispatch(prepareForRetryGetQuotes());
              await dispatch(
                fetchQuotesAndSetQuoteState(
                  history,
                  fromTokenInputValue,
                  maxSlippage,
                  trackEvent,
                ),
              );
            } else if (errorKey === EXPIRED_ERROR) {
              await dispatch(prepareToLeaveSwaps());
              await dispatch(navigateBackToBuildQuote(history));
            } else if (errorKey) {
              await dispatch(navigateBackToBuildQuote(history));
            } else if (
              isSwapsDefaultTokenSymbol(swapMetaData?.token_to, chainId) ||
              swapComplete
            ) {
              history.push(DEFAULT_ROUTE);
            } else if (!swapComplete && waitExchangerVerify) {
              await dispatch(
                clientP2PCancelTransaction({
                  exchangeId: exchangerSettings.exchangeId,
                  txData: transaction,
                }),
              );
              routeToActivity();
            } else {
              routeToActivity();
            }
          }}
          onCancel={async () => {
            routeToActivity();
          }}
          submitText={submitText}
          disabled={disableSubmitting}
          submitButtonType={submitButtonType}
          hideCancel={![QUOTES_EXPIRED_ERROR].includes(errorKey)}
        />
      )}
    </div>
  );
}

AwaitingSwap.propTypes = {
  hideFooter: PropTypes.bool,
  swapComplete: PropTypes.bool,
  errorKey: PropTypes.oneOf([
    QUOTES_EXPIRED_ERROR,
    SWAP_FAILED_ERROR,
    EXPIRED_ERROR,
    ERROR_FETCHING_QUOTES,
    QUOTES_NOT_AVAILABLE_ERROR,
    OFFLINE_FOR_MAINTENANCE,
    CONTRACT_DATA_DISABLED_ERROR,
  ]),
  submittingSwap: PropTypes.bool,
  transaction: PropTypes.object,
  onSubmit: PropTypes.func,
  onSwapNew: PropTypes.func,
};
