/* eslint-disable no-negated-condition */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import PropTypes from 'prop-types';
import classnames from 'classnames';

import { TransactionType } from '../../../../../../shared/constants/transaction';
import { toChecksumHexAddress } from '../../../../../../shared/modules/hexstring-utils';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import useAddressDetails from '../../../../../hooks/useAddressDetails';
import { getIpfsGateway } from '../../../../../selectors';

import Identicon from '../../../../ui/identicon';
import InfoTooltip from '../../../../ui/info-tooltip';
import NicknamePopovers from '../../../modals/nickname-popovers';
import { Text } from '../../../../component-library';
import { TextVariant } from '../../../../../helpers/constants/design-system';
import { ORIGIN_METAMASK } from '../../../../../../shared/constants/app';
import SiteOrigin from '../../../../ui/site-origin';
import { getAssetImageURL } from '../../../../../helpers/utils/util';

const ConfirmPageContainerSummary = (props) => {
  const {
    action,
    title,
    titleComponent,
    subtitleComponent,
    hideSubtitle,
    className,
    tokenAddress,
    toAddress,
    nonce,
    origin,
    hideTitle,
    image,
    transactionType,
    chainId,
  } = props;

  const [showNicknamePopovers, setShowNicknamePopovers] = useState(false);
  const t = useI18nContext();
  const ipfsGateway = useSelector(getIpfsGateway);

  const contractInitiatedTransactionType = [
    TransactionType.contractInteraction,
    TransactionType.tokenMethodTransfer,
    TransactionType.tokenMethodTransferFrom,
    TransactionType.tokenMethodSafeTransferFrom,
  ];
  const isContractTypeTransaction =
    contractInitiatedTransactionType.includes(transactionType);
  let contractAddress;
  if (isContractTypeTransaction) {
    // If the transaction is TOKEN_METHOD_TRANSFER or TOKEN_METHOD_TRANSFER_FROM
    // the contract address is passed down as tokenAddress, if it is anyother
    // type of contract interaction it is passed as toAddress
    contractAddress =
      transactionType === TransactionType.tokenMethodTransfer ||
      transactionType === TransactionType.tokenMethodTransferFrom ||
      transactionType === TransactionType.tokenMethodSafeTransferFrom ||
      transactionType === TransactionType.tokenMethodSetApprovalForAll
        ? tokenAddress
        : toAddress;
  }

  const { toName, isTrusted } = useAddressDetails(contractAddress);
  const checksummedAddress = toChecksumHexAddress(contractAddress);

  const renderImage = () => {
    const imagePath = getAssetImageURL(image, ipfsGateway);

    if (image) {
      return (
        <img
          className="confirm-page-container-summary__icon"
          width={36}
          src={imagePath}
        />
      );
    } else if (contractAddress) {
      return (
        <Identicon
          className="confirm-page-container-summary__icon"
          diameter={36}
          address={contractAddress}
        />
      );
    }
    return null;
  };

  return (
    <div className={classnames('confirm-page-container-summary', className)}>
      {origin === ORIGIN_METAMASK ? null : (
        <SiteOrigin
          className="confirm-page-container-summary__origin"
          siteOrigin={origin}
        />
      )}
      <div className="confirm-page-container-summary__action-row">
        <div className="confirm-page-container-summary__action">
          {isContractTypeTransaction && toName && (
            <span className="confirm-page-container-summary__action__contract-address">
              <button
                className="confirm-page-container-summary__action__contract-address-btn"
                onClick={() => setShowNicknamePopovers(true)}
                role="button"
              >
                {toName}
              </button>
              :
            </span>
          )}
          <span className="confirm-page-container-summary__action__name">
            {action}
          </span>
          {isContractTypeTransaction && isTrusted === false && (
            <InfoTooltip
              position="top"
              contentText={t('unverifiedContractAddressMessage')}
            />
          )}
        </div>
        {nonce && (
          <div className="confirm-page-container-summary__nonce">
            {`#${nonce}`}
          </div>
        )}
      </div>
      <>
        <div className="confirm-page-container-summary__title">
          {renderImage()}
          {!hideTitle ? (
            <Text
              className="confirm-page-container-summary__title-text"
              variant={
                title && title.length < 10
                  ? TextVariant.displayMd
                  : TextVariant.headingMd
              }
              as={title && title.length < 10 ? 'h1' : 'h3'}
              title={title}
            >
              {titleComponent || title}
            </Text>
          ) : null}
        </div>
        {hideSubtitle ? null : (
          <div className="confirm-page-container-summary__subtitle">
            {subtitleComponent}
          </div>
        )}
      </>
      {showNicknamePopovers && (
        <NicknamePopovers
          onClose={() => setShowNicknamePopovers(false)}
          address={checksummedAddress}
          chainId={chainId}
        />
      )}
    </div>
  );
};

ConfirmPageContainerSummary.propTypes = {
  action: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  image: PropTypes.string,
  titleComponent: PropTypes.node,
  subtitleComponent: PropTypes.node,
  hideSubtitle: PropTypes.bool,
  className: PropTypes.string,
  tokenAddress: PropTypes.string,
  toAddress: PropTypes.string,
  nonce: PropTypes.string,
  origin: PropTypes.string.isRequired,
  hideTitle: PropTypes.bool,
  transactionType: PropTypes.string,
  provider: PropTypes.object,
};

export default ConfirmPageContainerSummary;
