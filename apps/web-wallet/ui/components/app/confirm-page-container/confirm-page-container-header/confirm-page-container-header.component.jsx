import React from 'react';
import PropTypes from 'prop-types';
import {
  ENVIRONMENT_TYPE_POPUP,
  ENVIRONMENT_TYPE_NOTIFICATION,
} from '../../../../../shared/constants/app';
import { NETWORK_TO_NAME_MAP } from '../../../../../shared/constants/network';
import { getEnvironmentType } from '../../../../../app/scripts/lib/util';
import NetworkDisplay from '../../network-display';
import Identicon from '../../../ui/identicon';
import { shortenAddress } from '../../../../helpers/utils/util';
import AccountMismatchWarning from '../../../ui/account-mismatch-warning/account-mismatch-warning.component';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { Icon, ICON_NAMES } from '../../../component-library';

export default function ConfirmPageContainerHeader({
  onEdit,
  showEdit,
  accountAddress,
  showAccountInHeader,
  showNavigation = true,
  children,
  chainId,
}) {
  const t = useI18nContext();
  const windowType = getEnvironmentType();
  const isFullScreen =
    windowType !== ENVIRONMENT_TYPE_NOTIFICATION &&
      windowType !== ENVIRONMENT_TYPE_POPUP;

  if (!showEdit && isFullScreen) {
    return children;
  }
  return (
    <div
      className="confirm-page-container-header"
      data-testid="header-container"
    >
      {(showAccountInHeader || showNavigation) && (
        <div className="confirm-page-container-header__row">
          {showAccountInHeader && (
            <div className="confirm-page-container-header__address-container">
              <div className="confirm-page-container-header__address-identicon">
                <Identicon address={accountAddress} diameter={24} />
              </div>
              <div
                className="confirm-page-container-header__address"
                data-testid="header-address"
              >
                {shortenAddress(accountAddress)}
              </div>
              <AccountMismatchWarning address={accountAddress} />
            </div>
          )}
          {showNavigation && (
            <div
              className="confirm-page-container-header__back-button-container"
              style={{
                visibility: showEdit ? 'initial' : 'hidden',
              }}
            >
              <Icon name={ICON_NAMES.ARROW_LEFT} />
              <span
                data-testid="confirm-page-back-edit-button"
                className="confirm-page-container-header__back-button"
                onClick={() => onEdit()}
              >
                {t('edit')}
              </span>
            </div>
          )}
          {isFullScreen ? null : (
            <NetworkDisplay
              targetNetwork={{
                nickname: NETWORK_TO_NAME_MAP[chainId],
                // type: ???
              }}
            />
          )}
        </div>
      )}
      {children}
    </div>
  );
}

ConfirmPageContainerHeader.propTypes = {
  accountAddress: PropTypes.string,
  showAccountInHeader: PropTypes.bool,
  showNavigation: PropTypes.bool,
  showEdit: PropTypes.bool,
  onEdit: PropTypes.func,
  children: PropTypes.node,
  chainId: PropTypes.string,
};

ConfirmPageContainerHeader.defaultProps = {
  chainId: undefined,
};
