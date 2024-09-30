import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AccountModalContainer from '../account-modal-container';
import QrView from '../../../ui/qr-code';
import Button from '../../../ui/button';
import { Text } from '../../../component-library';
import { getURLHostName } from '../../../../helpers/utils/util';
import {
  EVENT,
  EVENT_NAMES,
} from '../../../../../shared/constants/metametrics';
import { NETWORKS_ROUTE } from '../../../../helpers/constants/routes';
import { TextVariant } from '../../../../helpers/constants/design-system';

export default class AccountDetailsModal extends Component {
  static defaultProps = {
    token: null,
    id: '',
  };

  static propTypes = {
    selectedIdentity: PropTypes.object,
    history: PropTypes.object,
    hideModal: PropTypes.func,
    token: PropTypes.object,
  };

  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  render() {
    const { selectedIdentity, history, hideModal, token } = this.props;
    const { name } = selectedIdentity;
    const { account = '', name: tokenName } = token;

    // const chainProvider = new ChainProvider(token.provider);

    const blockExplorerLinkText = {
      firstPart: 'blockExplorerView',
      secondPart: getURLHostName(chainProvider.blockExplorerUrl),
    };

    const routeToAddBlockExplorerUrl = () => {
      hideModal();
      history.push(`${NETWORKS_ROUTE}#blockExplorerUrl`);
    };

    const openBlockExplorer = () => {
      const accountLink = chainProvider.getAccountLink(account);
      this.context.trackEvent({
        category: EVENT.CATEGORIES.NAVIGATION,
        event: EVENT_NAMES.EXTERNAL_LINK_CLICKED,
        properties: {
          link_type: EVENT.EXTERNAL_LINK_TYPES.ACCOUNT_TRACKER,
          location: 'Account Details Modal',
          url_domain: getURLHostName(accountLink),
        },
      });
      global.platform.openTab({
        url: accountLink,
      });
    };

    return (
      <AccountModalContainer
        image={token?.image}
        className="account-details-modal"
      >
        <Text variant={TextVariant.bodyLgMedium} as="p" marginBottom={5}>
          {tokenName || name}
        </Text>

        <QrView
          Qr={{
            data: account || 'Unexpected address error',
          }}
        />

        <div className="account-details-modal__divider" />

        <Button
          type="secondary"
          className="account-details-modal__button"
          onClick={
            blockExplorerLinkText.firstPart === 'addBlockExplorer'
              ? routeToAddBlockExplorerUrl
              : openBlockExplorer
          }
        >
          {this.context.t(blockExplorerLinkText.firstPart, [
            blockExplorerLinkText.secondPart,
          ])}
        </Button>
      </AccountModalContainer>
    );
  }
}
