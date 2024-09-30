import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
  ExchangeP2PStatus,
  ExchangePairType,
} from '../../../shared/constants/exchanger';
import P2PChat from '../../components/app/p2p-chat';
import StepProgressBarNew from '../../components/app/step-progress-bar-new';
import { P2P_STAGES } from '../../components/app/step-progress-bar-new/stages';
import { ICON_NAMES, Icon, Text } from '../../components/component-library';
import Alert from '../../components/ui/alert';
import Asset from '../../components/ui/asset';
import Box from '../../components/ui/box';
import PaymentMethodDisplay from '../../components/ui/payment-method-display';
import {
  Color,
  DISPLAY,
  AlignItems,
  IconColor,
  Size,
  TEXT_ALIGN,
} from '../../helpers/constants/design-system';
import { EXCHANGER_ROUTE } from '../../helpers/constants/routes';
import ConfirmTransactionBase from '../confirm-transaction-base';
import CountdownTimer from '../swaps/countdown-timer';
import ViewOnBlockExplorer from '../swaps/view-on-block-explorer/view-on-block-explorer';

export default class ConfirmP2P extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object.isRequired,
    txData: PropTypes.object.isRequired,
    fromAsset: PropTypes.object.isRequired,
    toAsset: PropTypes.object.isRequired,
    isReserveConfirmation: PropTypes.bool.isRequired,
    isWaitExchangerTransfer: PropTypes.bool.isRequired,
    sendTransaction: PropTypes.func.isRequired,
    cancelTransaction: PropTypes.func.isRequired,
  };

  renderData() {
    const { t } = this.context;
    const {
      txData: {
        exchangerSettings = {},
        receiveHash,
        swapMetaData,
        approveDeadline,
        time,
        pairType,
      },
      fromAsset,
      toAsset,
      isReserveConfirmation,
    } = this.props;

    const blockExplorerUrlFrom =
      receiveHash && toAsset.sharedProvider.getBlockExplorerLink(receiveHash);

    const isApprovedFunds =
      exchangerSettings.status === ExchangeP2PStatus.waitExchangerTransfer;
    return (
      <Box
        color={Color.textAlternative}
        paddingBottom={4}
        paddingLeft={4}
        paddingRight={4}
      >
        <StepProgressBarNew
          marginTop={6}
          stages={P2P_STAGES.filter(({ pairTypes }) =>
            pairTypes.includes(pairType),
          )}
          value={exchangerSettings.status}
        />
        {exchangerSettings.clientPaymentMethod && (
          <PaymentMethodDisplay
            title="Client payment method"
            paymentMethod={exchangerSettings.clientPaymentMethod}
            marginTop={4}
          />
        )}
        {exchangerSettings.exchangerPaymentMethod && (
          <PaymentMethodDisplay
            title="My payment method"
            paymentMethod={exchangerSettings.exchangerPaymentMethod}
            marginTop={4}
          />
        )}
        {receiveHash && (
          <Box
            marginTop={2}
            marginBottom={5}
            display={DISPLAY.FLEX}
            alignItems={AlignItems.center}
          >
            <Text>Client transaction</Text>
            <div className="flex-grow" />
            <ViewOnBlockExplorer blockExplorerUrl={blockExplorerUrlFrom} />
          </Box>
        )}
        {isReserveConfirmation && (
          <Text marginTop={3}>
            Please confirm or cancel reserve the exchange
          </Text>
        )}
        {!isReserveConfirmation && (
          <Box>
            {toAsset.isFiat && (
              <Box>
                <Box marginTop={2} marginBottom={2}>
                  <Alert
                    visible={isApprovedFunds}
                    msg={`Client confirmed ${swapMetaData.token_to} transfer`}
                  />
                </Box>

                <Text>
                  Please {isApprovedFunds ? 'confirm' : 'wait for'} client{' '}
                  <strong>
                    {Number(swapMetaData.token_to_amount.toFixed(8))}{' '}
                    {swapMetaData.token_to}
                  </strong>{' '}
                  transfer
                </Text>
              </Box>
            )}
            {fromAsset.isFiat && (
              <Box>
                <Box marginTop={2} marginBottom={2}>
                  <Alert
                    visible={isApprovedFunds}
                    msg={`Client transaction ${swapMetaData.token_to} transfer has been verified in blockchain`}
                  />
                </Box>

                <Text>
                  Please send{' '}
                  <strong>
                    {Number(swapMetaData.token_from_amount.toFixed(8))}{' '}
                    {swapMetaData.token_from}
                  </strong>{' '}
                  to client bank account and press confirm button
                </Text>
              </Box>
            )}
            {approveDeadline && (
              <>
                <Box marginTop={4} marginBottom={4} className="divider" />
                <Text marginTop={4}>
                  <CountdownTimer
                    timeStarted={time}
                    timerBase={approveDeadline - time}
                    labelKey="approvalTimerP2PLabel"
                    infoTooltipLabelKey="approvalTimerP2PInfo"
                    warningTime="1:00"
                  />
                </Text>
              </>
            )}
            <Box marginTop={4}>
              <P2PChat
                tradeId={exchangerSettings.exchangeId}
                userName="Client"
              />
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  render() {
    const {
      txData: { pairType, swapMetaData },
      fromAsset,
      toAsset,
      sendTransaction,
      cancelTransaction,
      history,
      isReserveConfirmation,
      isWaitExchangerTransfer,
    } = this.props;

    const needApproveReserve =
      [ExchangePairType.cryptoFiat, ExchangePairType.fiatCrypto].includes(
        pairType,
      ) && isReserveConfirmation;

    const needApproveFiat = isWaitExchangerTransfer;

    const submitProps = {
      visible: needApproveReserve || needApproveFiat,
      label: isReserveConfirmation ? 'Confirm reserve' : 'Confirm',
    };
    const cancelProps = {
      visible: needApproveReserve || needApproveFiat,
      disabled:
        pairType === ExchangePairType.cryptoFiat && isWaitExchangerTransfer,
      label: 'Cancel',
    };

    // !(
    //   pairType === ExchangePairType.cryptoFiat &&
    //   exchangerSettings.status === ExchangeP2PStatus.waitExchangerTransfer
    // );

    return (
      <ConfirmTransactionBase
        cancelTransaction={cancelTransaction}
        sendTransaction={sendTransaction}
        detailsComponent={this.renderData()}
        hideSenderToRecipient={!toAsset.isFiat}
        submitProps={submitProps}
        cancelProps={cancelProps}
        hideTitle
        onClickViewInActivity={() => history.push(EXCHANGER_ROUTE)}
        subtitleComponent={
          <Box
            marginTop={4}
            display={DISPLAY.FLEX}
            alignItems={AlignItems.center}
          >
            <Asset
              label="You give"
              asset={fromAsset}
              amount={swapMetaData.token_from_amount}
            />
            <Box className="flex-grow" textAlign={TEXT_ALIGN.CENTER}>
              <Icon
                className="exchange-stats-card__exchange-icon"
                name={ICON_NAMES.EXCHANGE_DIRECTION}
                color={IconColor.iconAlternative}
                size={Size.XL}
              />
            </Box>
            <Asset
              label="You get"
              asset={toAsset}
              amount={swapMetaData.token_to_amount}
            />
          </Box>
        }
      />
    );
  }
}
