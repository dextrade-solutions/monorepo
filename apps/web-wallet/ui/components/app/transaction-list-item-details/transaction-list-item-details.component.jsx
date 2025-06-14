import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import copyToClipboard from 'copy-to-clipboard';
import SenderToRecipient from '../../ui/sender-to-recipient';
import { DEFAULT_VARIANT } from '../../ui/sender-to-recipient/sender-to-recipient.constants';
import Disclosure from '../../ui/disclosure';
import TransactionActivityLog from '../transaction-activity-log';
import TransactionBreakdown from '../transaction-breakdown';
import Button from '../../ui/button';
import Tooltip from '../../ui/tooltip';
import CancelButton from '../cancel-button';
import Popover from '../../ui/popover';
import { SECOND } from '../../../../shared/constants/time';
import { EVENT } from '../../../../shared/constants/metametrics';
import { TransactionType } from '../../../../shared/constants/transaction';
import { getURLHostName } from '../../../helpers/utils/util';
import TransactionDecoding from '../transaction-decoding';
import { NETWORKS_ROUTE } from '../../../helpers/constants/routes';
import TransactionStatusLabel from '../transaction-status-label/transaction-status-label';
import TransactionP2pDetails from '../transaction-swap-details';
import { AssetModel } from '../../../../shared/lib/asset-model';

export default class TransactionListItemDetails extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static defaultProps = {
    recipientEns: null,
  };

  static propTypes = {
    onCancel: PropTypes.func,
    onRetry: PropTypes.func,
    showCancel: PropTypes.bool,
    showSpeedUp: PropTypes.bool,
    showRetry: PropTypes.bool,
    isEarliestNonce: PropTypes.bool,
    primaryCurrency: PropTypes.string,
    transactionGroup: PropTypes.object,
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    recipientEns: PropTypes.string,
    recipientAddress: PropTypes.string,
    recipientName: PropTypes.string,
    recipientMetadataName: PropTypes.string,
    rpcPrefs: PropTypes.object,
    senderAddress: PropTypes.string.isRequired,
    tryReverseResolveAddress: PropTypes.func.isRequired,
    senderNickname: PropTypes.string.isRequired,
    recipientNickname: PropTypes.string,
    isCustomNetwork: PropTypes.bool,
    history: PropTypes.object,
    blockExplorerLinkText: PropTypes.object,
    displayedStatusKey: PropTypes.string,
    date: PropTypes.string,
    isPending: PropTypes.bool,
    isSwap: PropTypes.bool,
    sendAsset: PropTypes.object,
  };

  state = {
    justCopied: false,
  };

  handleBlockExplorerClick = (hash) => {
    const { rpcPrefs, isCustomNetwork, history, onClose, sendAsset } =
      this.props;

    const blockExplorerLink =
      sendAsset.sharedProvider.getBlockExplorerLink(hash);

    if (!rpcPrefs.blockExplorerUrl && isCustomNetwork) {
      onClose();
      history.push(`${NETWORKS_ROUTE}#blockExplorerUrl`);
    } else {
      this.context.trackEvent({
        category: EVENT.CATEGORIES.TRANSACTIONS,
        event: 'Clicked Block Explorer Link',
        properties: {
          link_type: 'Transaction Block Explorer',
          action: 'Transaction Details',
          block_explorer_domain: getURLHostName(blockExplorerLink),
        },
      });

      global.platform.openTab({
        url: blockExplorerLink,
      });
    }
  };

  handleCancel = (event) => {
    const { onCancel, onClose } = this.props;
    onCancel(event);
    onClose();
  };

  handleRetry = (event) => {
    const { onClose, onRetry } = this.props;
    onRetry(event);
    onClose();
  };

  handleCopyTxId = (txHash) => {
    this.setState({ justCopied: true }, () => {
      copyToClipboard(txHash);
      setTimeout(() => this.setState({ justCopied: false }), SECOND);
    });
  };

  componentDidMount() {
    const { recipientAddress, tryReverseResolveAddress } = this.props;

    if (recipientAddress) {
      tryReverseResolveAddress(recipientAddress);
    }
  }

  render() {
    const { t } = this.context;
    const { justCopied } = this.state;
    const {
      transactionGroup,
      primaryCurrency,
      showSpeedUp,
      showRetry,
      recipientEns,
      recipientAddress,
      recipientName,
      recipientMetadataName,
      senderAddress,
      isEarliestNonce,
      senderNickname,
      title,
      onClose,
      recipientNickname,
      showCancel,
      // transactionStatus: TransactionStatus,
      blockExplorerLinkText,
      displayedStatusKey,
      isPending,
      isSwap,
      date,
    } = this.props;
    const {
      primaryTransaction: transaction,
      initialTransaction: { type },
    } = transactionGroup;
    const { hash } = transaction;

    return (
      <Popover title={title} onClose={onClose}>
        <div className="transaction-list-item-details">
          <div className="transaction-list-item-details__operations">
            <div className="transaction-list-item-details__header-buttons">
              {showSpeedUp && (
                <Button
                  type="primary"
                  onClick={this.handleRetry}
                  className="transaction-list-item-details__header-button-rounded-button"
                  data-testid="speedup-button"
                >
                  {t('speedUp')}
                </Button>
              )}
              {showCancel && (
                <CancelButton
                  transaction={transaction}
                  cancelTransaction={this.handleCancel}
                  detailsModal
                />
              )}
              {showRetry && (
                <Tooltip title={t('retryTransaction')}>
                  <Button
                    type="raised"
                    onClick={this.handleRetry}
                    className="transaction-list-item-details__header-button"
                    data-testid="rety-button"
                  >
                    <i className="fa fa-sync"></i>
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
          {!isSwap && (
            <div className="transaction-list-item-details__header">
              <div className="transaction-list-item-details__tx-status">
                <div>{t('status')}</div>
                <div>
                  <TransactionStatusLabel
                    isPending={isPending}
                    isEarliestNonce={isEarliestNonce}
                    error={transaction.err}
                    date={date}
                    status={displayedStatusKey}
                    statusOnly
                  />
                </div>
              </div>

              <div className="transaction-list-item-details__tx-hash">
                <div>
                  <Button
                    type="link"
                    onClick={() => this.handleBlockExplorerClick(hash)}
                    disabled={!hash}
                    padding={0}
                    margin={0}
                  >
                    {blockExplorerLinkText.firstPart === 'addBlockExplorer'
                      ? t('addBlockExplorer')
                      : t('viewOnBlockExplorer')}
                  </Button>
                </div>
                <div>
                  <Tooltip
                    wrapperClassName="transaction-list-item-details__header-button"
                    containerClassName="transaction-list-item-details__header-button-tooltip-container"
                    title={justCopied ? t('copiedExclamation') : null}
                  >
                    <Button
                      type="link"
                      onClick={() => this.handleCopyTxId(hash)}
                      disabled={!hash}
                    >
                      {t('copyTransactionId')}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

          {isSwap ? (
            <TransactionP2pDetails txData={transaction} />
          ) : (
            <div className="transaction-list-item-details__body">
              <>
                <div className="transaction-list-item-details__sender-to-recipient-header">
                  <div>{t('from')}</div>
                  <div>{t('to')}</div>
                </div>
                <div className="transaction-list-item-details__sender-to-recipient-container">
                  <SenderToRecipient
                    warnUserOnAccountMismatch={false}
                    variant={DEFAULT_VARIANT}
                    addressOnly
                    recipientEns={recipientEns}
                    recipientAddress={recipientAddress}
                    recipientNickname={recipientNickname}
                    recipientName={recipientName}
                    recipientMetadataName={recipientMetadataName}
                    senderName={senderNickname}
                    senderAddress={senderAddress}
                    onRecipientClick={() => {
                      this.context.trackEvent({
                        category: EVENT.CATEGORIES.NAVIGATION,
                        event: 'Copied "To" Address',
                        properties: {
                          action: 'Activity Log',
                          legacy_event: true,
                        },
                      });
                    }}
                    onSenderClick={() => {
                      this.context.trackEvent({
                        category: EVENT.CATEGORIES.NAVIGATION,
                        event: 'Copied "From" Address',
                        properties: {
                          action: 'Activity Log',
                          legacy_event: true,
                        },
                      });
                    }}
                  />
                </div>
              </>

              <div className="transaction-list-item-details__cards-container">
                <TransactionBreakdown
                  nonce={transactionGroup.initialTransaction.txParams?.nonce}
                  isTokenApprove={
                    type === TransactionType.tokenMethodApprove ||
                    type === TransactionType.tokenMethodSetApprovalForAll
                  }
                  transaction={transaction}
                  primaryCurrency={primaryCurrency}
                  className="transaction-list-item-details__transaction-breakdown"
                />
                {transactionGroup.initialTransaction.type !==
                  TransactionType.incoming && (
                  <Disclosure title={t('activityLog')} size="small">
                    <TransactionActivityLog
                      transactionGroup={transactionGroup}
                      className="transaction-list-item-details__transaction-activity-log"
                      onCancel={this.handleCancel}
                      onRetry={this.handleRetry}
                      isEarliestNonce={isEarliestNonce}
                    />
                  </Disclosure>
                )}
                {transactionGroup.initialTransaction?.txParams?.data ? (
                  <Disclosure title="Transaction data" size="small">
                    <TransactionDecoding
                      title={t('transactionData')}
                      to={transactionGroup.initialTransaction.txParams?.to}
                      inputData={
                        transactionGroup.initialTransaction.txParams?.data
                      }
                    />
                  </Disclosure>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </Popover>
    );
  }
}
