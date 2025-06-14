import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { EditGasModes } from '../../../../shared/constants/gas';
import { GasFeeContextProvider } from '../../../contexts/gasFee';
import {
  TokenStandard,
  TransactionType,
} from '../../../../shared/constants/transaction';
import { NETWORK_TO_NAME_MAP } from '../../../../shared/constants/network';

import { PageContainerFooter } from '../../ui/page-container';
import Button from '../../ui/button';
import ActionableMessage from '../../ui/actionable-message/actionable-message';
import SenderToRecipient from '../../ui/sender-to-recipient';

import AdvancedGasFeePopover from '../advanced-gas-fee-popover';
import EditGasFeePopover from '../edit-gas-fee-popover/edit-gas-fee-popover';
import EditGasPopover from '../edit-gas-popover';
import ErrorMessage from '../../ui/error-message';
import { INSUFFICIENT_FUNDS_ERROR_KEY } from '../../../helpers/constants/error-keys';
import Typography from '../../ui/typography';
import { TypographyVariant } from '../../../helpers/constants/design-system';

import NetworkAccountBalanceHeader from '../network-account-balance-header/network-account-balance-header';
import { fetchTokenBalance } from '../../../../shared/lib/token-util';
import SetApproveForAllWarning from '../set-approval-for-all-warning';
import { useI18nContext } from '../../../hooks/useI18nContext';
///: BEGIN:ONLY_INCLUDE_IN(flask)
// import useTransactionInsights from '../../../hooks/useTransactionInsights';
///: END:ONLY_INCLUDE_IN(flask)
import {
  getAccountName,
  getAddressBookEntry,
  getIsBuyableChain,
  getMetadataContractName,
  getMetaMaskIdentities,
  getNetworkIdentifier,
  getSwapsDefaultToken,
} from '../../../selectors';
import useRamps from '../../../hooks/experiences/useRamps';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { EVENT, EVENT_NAMES } from '../../../../shared/constants/metametrics';
import {
  ConfirmPageContainerHeader,
  ConfirmPageContainerContent,
  ConfirmPageContainerNavigation,
} from '.';

const ConfirmPageContainer = (props) => {
  const {
    hideNavigation = false,
    showEdit,
    onEdit,
    fromName,
    fromAddress,
    toEns,
    toNickname,
    toAddress,
    disabled,
    errorKey,
    errorMessage,
    contentComponent,
    action,
    title,
    image,
    titleComponent,
    subtitleComponent,
    hideSubtitle,
    detailsComponent,
    dataComponent,
    dataHexComponent,
    onCancelAll,
    onCancel,
    onSubmit,
    onSetApprovalForAll,
    showWarningModal,
    tokenAddress,
    nonce,
    unapprovedTxCount,
    warning,
    hideSenderToRecipient,
    showAccountInHeader,
    origin,
    ethGasPriceWarning,
    editingGas,
    handleCloseEditGas,
    currentTransaction,
    supportsEIP1559,
    nativeCurrency,
    txData,
    assetStandard,
    isApprovalOrRejection,
    onClickViewInActivity,
    cancelProps,
    submitProps,
  } = props;
  const t = useI18nContext();
  const trackEvent = useContext(MetaMetricsContext);

  const [collectionBalance, setCollectionBalance] = useState(0);

  const isBuyableChain = useSelector(getIsBuyableChain);
  const contact = useSelector((state) => getAddressBookEntry(state, toAddress));
  const networkIdentifier = useSelector(getNetworkIdentifier);
  const defaultToken = useSelector(getSwapsDefaultToken);
  const accountBalance = defaultToken.string;
  const identities = useSelector(getMetaMaskIdentities);
  const ownedAccountName = getAccountName(identities, toAddress);
  const toName = ownedAccountName || contact?.name;
  const recipientIsOwnedAccount = Boolean(ownedAccountName);
  const toMetadataName = useSelector((state) =>
    getMetadataContractName(state, toAddress),
  );

  // TODO: Move useRamps hook to the confirm-transaction-base parent component.
  // TODO: openBuyCryptoInPdapp should be passed to this component as a custom prop.
  // We try to keep this component for layout purpose only, we need to move this hook to the confirm-transaction-base parent
  // component once it is converted to a functional component
  const { openBuyCryptoInPdapp } = useRamps();

  const isSetApproveForAll =
    currentTransaction.type === TransactionType.tokenMethodSetApprovalForAll;

  const shouldDisplayWarning =
    contentComponent && disabled && (errorKey || errorMessage);

  const hideTitle =
    (currentTransaction.type === TransactionType.contractInteraction ||
      currentTransaction.type === TransactionType.deployContract) &&
    currentTransaction.txParams?.value === '0x0';

  const networkName =
    NETWORK_TO_NAME_MAP[currentTransaction.chainId] || networkIdentifier;

  const fetchCollectionBalance = useCallback(async () => {
    const tokenBalance = await fetchTokenBalance(
      tokenAddress,
      fromAddress,
      global.ethereumProvider,
    );
    setCollectionBalance(tokenBalance?.balance?.words?.[0] || 0);
  }, [fromAddress, tokenAddress]);

  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  // As confirm-transction-base is converted to functional component
  // this code can bemoved to it.
  // const insightComponent = useTransactionInsights({
  //   txData,
  // });
  ///: END:ONLY_INCLUDE_IN

  useEffect(() => {
    if (isSetApproveForAll && assetStandard === TokenStandard.ERC721) {
      fetchCollectionBalance();
    }
  }, [
    currentTransaction,
    assetStandard,
    isSetApproveForAll,
    fetchCollectionBalance,
    collectionBalance,
  ]);

  const renderContainer = () => (
    <div className="page-container" data-testid="page-container">
      {!hideNavigation && <ConfirmPageContainerNavigation />}
      {assetStandard === TokenStandard.ERC20 ||
      assetStandard === TokenStandard.ERC721 ||
      assetStandard === TokenStandard.ERC1155 ? (
        <NetworkAccountBalanceHeader
          accountName={fromName}
          accountBalance={accountBalance}
          tokenName={nativeCurrency}
          accountAddress={fromAddress}
          networkName={networkName}
          chainId={currentTransaction.chainId}
        />
      ) : (
        <ConfirmPageContainerHeader
          showEdit={showEdit}
          onEdit={() => onEdit()}
          showAccountInHeader={showAccountInHeader}
          showNavigation={!hideNavigation}
          accountAddress={fromAddress}
          chainId={currentTransaction.chainId}
        >
          {hideSenderToRecipient ? null : (
            <SenderToRecipient
              senderName={fromName}
              senderAddress={fromAddress}
              recipientName={toName}
              recipientMetadataName={toMetadataName}
              recipientAddress={toAddress}
              recipientEns={toEns}
              recipientNickname={toNickname}
              recipientIsOwnedAccount={recipientIsOwnedAccount}
            />
          )}
        </ConfirmPageContainerHeader>
      )}
      {contentComponent || (
        <ConfirmPageContainerContent
          action={action}
          title={title}
          image={image}
          titleComponent={titleComponent}
          subtitleComponent={subtitleComponent}
          hideSubtitle={hideSubtitle}
          detailsComponent={detailsComponent}
          dataComponent={dataComponent}
          dataHexComponent={dataHexComponent}
          ///: BEGIN:ONLY_INCLUDE_IN(flask)
          // insightComponent={insightComponent}
          ///: END:ONLY_INCLUDE_IN
          errorMessage={errorMessage}
          errorKey={errorKey}
          tokenAddress={tokenAddress}
          nonce={nonce}
          warning={warning}
          onCancelAll={onCancelAll}
          onCancel={onCancel}
          cancelText={t('reject')}
          onSubmit={onSubmit}
          submitText={t('confirm')}
          disabled={disabled}
          unapprovedTxCount={unapprovedTxCount}
          rejectNText={t('rejectTxsN', [unapprovedTxCount])}
          origin={origin}
          ethGasPriceWarning={ethGasPriceWarning}
          hideTitle={hideTitle}
          supportsEIP1559={supportsEIP1559}
          currentTransaction={currentTransaction}
          nativeCurrency={nativeCurrency}
          networkName={networkName}
          toAddress={toAddress}
          transactionType={currentTransaction.type}
          isBuyableChain={isBuyableChain}
          txData={txData}
          onClickViewInActivity={onClickViewInActivity}
          cancelProps={cancelProps}
          submitProps={submitProps}
        />
      )}
      {shouldDisplayWarning && errorKey === INSUFFICIENT_FUNDS_ERROR_KEY && (
        <div className="confirm-approve-content__warning">
          <ActionableMessage
            message={
              isBuyableChain ? (
                <Typography variant={TypographyVariant.H7} align="left">
                  {t('insufficientCurrencyBuyOrDeposit', [
                    nativeCurrency,
                    networkName,
                    <Button
                      type="inline"
                      className="confirm-page-container-content__link"
                      onClick={() => {
                        openBuyCryptoInPdapp();
                        trackEvent({
                          event: EVENT_NAMES.NAV_BUY_BUTTON_CLICKED,
                          category: EVENT.CATEGORIES.NAVIGATION,
                          properties: {
                            location: 'Transaction Confirmation',
                            text: 'Buy',
                          },
                        });
                      }}
                      key={`${nativeCurrency}-buy-button`}
                    >
                      {t('buyAsset', [nativeCurrency])}
                    </Button>,
                  ])}
                </Typography>
              ) : (
                <Typography variant={TypographyVariant.H7} align="left">
                  {t('insufficientCurrencyDeposit', [
                    nativeCurrency,
                    networkName,
                  ])}
                </Typography>
              )
            }
            useIcon
            iconFillColor="var(--color-error-default)"
            type="danger"
          />
        </div>
      )}
      {shouldDisplayWarning && errorKey !== INSUFFICIENT_FUNDS_ERROR_KEY && (
        <div className="confirm-approve-content__warning">
          <ErrorMessage errorKey={errorKey} />
        </div>
      )}
      {showWarningModal && (
        <SetApproveForAllWarning
          collectionName={title}
          senderAddress={fromAddress}
          name={fromName}
          isERC721={assetStandard === TokenStandard.ERC20}
          total={collectionBalance}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
      {contentComponent && (
        <PageContainerFooter
          onCancel={onCancel}
          cancelText={t('reject')}
          onSubmit={
            isSetApproveForAll && isApprovalOrRejection
              ? onSetApprovalForAll
              : onSubmit
          }
          submitText={t('confirm')}
          submitButtonType={
            isSetApproveForAll && isApprovalOrRejection
              ? 'danger-primary'
              : 'primary'
          }
          disabled={disabled}
        >
          {unapprovedTxCount > 1 && (
            <a onClick={onCancelAll}>{t('rejectTxsN', [unapprovedTxCount])}</a>
          )}
        </PageContainerFooter>
      )}
      {editingGas && !supportsEIP1559 && (
        <EditGasPopover
          mode={EditGasModes.modifyInPlace}
          onClose={handleCloseEditGas}
          transaction={currentTransaction}
        />
      )}
      {supportsEIP1559 && (
        <>
          <EditGasFeePopover />
          <AdvancedGasFeePopover />
        </>
      )}
    </div>
  );

  if (currentTransaction.txParams?.localId) {
    return (
      <GasFeeContextProvider transaction={currentTransaction}>
        {renderContainer()}
      </GasFeeContextProvider>
    );
  }
  return renderContainer();
};

ConfirmPageContainer.propTypes = {
  // Header
  hideNavigation: PropTypes.bool,
  action: PropTypes.string,
  hideSubtitle: PropTypes.bool,
  onEdit: PropTypes.func,
  showEdit: PropTypes.bool,
  subtitleComponent: PropTypes.node,
  title: PropTypes.string,
  image: PropTypes.string,
  titleComponent: PropTypes.node,
  hideSenderToRecipient: PropTypes.bool,
  showAccountInHeader: PropTypes.bool,
  assetStandard: PropTypes.string,
  // Sender to Recipient
  fromAddress: PropTypes.string,
  fromName: PropTypes.string,
  toAddress: PropTypes.string,
  toEns: PropTypes.string,
  toNickname: PropTypes.string,
  // Content
  contentComponent: PropTypes.node,
  errorKey: PropTypes.string,
  errorMessage: PropTypes.string,
  dataComponent: PropTypes.node,
  dataHexComponent: PropTypes.node,
  detailsComponent: PropTypes.node,
  txData: PropTypes.object,
  tokenAddress: PropTypes.string,
  nonce: PropTypes.string,
  warning: PropTypes.string,
  unapprovedTxCount: PropTypes.number,
  origin: PropTypes.string.isRequired,
  ethGasPriceWarning: PropTypes.string,
  // Footer
  onCancelAll: PropTypes.func,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onSetApprovalForAll: PropTypes.func,
  showWarningModal: PropTypes.bool,
  disabled: PropTypes.bool,
  editingGas: PropTypes.bool,
  handleCloseEditGas: PropTypes.func,
  onClickViewInActivity: PropTypes.func,
  cancelProps: PropTypes.object,
  submitProps: PropTypes.object,
  // Gas Popover
  currentTransaction: PropTypes.object.isRequired,
  supportsEIP1559: PropTypes.bool,
  nativeCurrency: PropTypes.string,
  isApprovalOrRejection: PropTypes.bool,
};

export default ConfirmPageContainer;
