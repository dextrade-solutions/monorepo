import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import PageContainerFooter from '../../../components/ui/page-container/page-container-footer';
import {
  CONFIRM_TRANSACTION_ROUTE,
  DEFAULT_ROUTE,
} from '../../../helpers/constants/routes';
import { EVENT } from '../../../../shared/constants/metametrics';
import { SEND_STAGES } from '../../../ducks/send';

export default class SendFooter extends Component {
  static propTypes = {
    resetSendState: PropTypes.func,
    disabled: PropTypes.bool.isRequired,
    history: PropTypes.object,
    sign: PropTypes.func,
    sendStage: PropTypes.string,
    sendErrors: PropTypes.object,
    mostRecentOverviewPage: PropTypes.string.isRequired,
    cancelTx: PropTypes.func,
    draftTransactionID: PropTypes.string,
    submitText: PropTypes.string,
    onSubmit: PropTypes.func,
    txParam: PropTypes.any,
  };

  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  onCancel() {
    const {
      cancelTx,
      draftTransactionID,
      history,
      mostRecentOverviewPage,
      resetSendState,
      sendStage,
    } = this.props;

    if (draftTransactionID) {
      cancelTx({ id: draftTransactionID });
    }
    resetSendState();

    const nextRoute =
      sendStage === SEND_STAGES.EDIT ? DEFAULT_ROUTE : mostRecentOverviewPage;
    history.push(nextRoute);
  }

  async handleSubmit(event) {
    const { sign, history, txParam } = this.props;
    const { trackEvent } = this.context;
    event.preventDefault();

    if (this.props.onSubmit) {
      this.props.onSubmit(event, txParam);
      return;
    }
    const promise = sign();

    Promise.resolve(promise).then(() => {
      trackEvent({
        category: EVENT.CATEGORIES.TRANSACTIONS,
        event: 'Complete',
        properties: {
          action: 'Edit Screen',
          legacy_event: true,
        },
      });
      history.push(CONFIRM_TRANSACTION_ROUTE);
    });
  }

  componentDidUpdate(prevProps) {
    const { sendErrors } = this.props;
    const { trackEvent } = this.context;
    if (
      Object.keys(sendErrors).length > 0 &&
      isEqual(sendErrors, prevProps.sendErrors) === false
    ) {
      const errorField = Object.keys(sendErrors).find((key) => sendErrors[key]);
      const errorMessage = sendErrors[errorField];

      trackEvent({
        category: EVENT.CATEGORIES.TRANSACTIONS,
        event: 'Error',
        properties: {
          action: 'Edit Screen',
          legacy_event: true,
          errorField,
          errorMessage,
        },
      });
    }
  }

  render() {
    const { t } = this.context;
    const { sendStage, submitText } = this.props;
    return (
      <PageContainerFooter
        onCancel={() => this.onCancel()}
        onSubmit={(e) => this.handleSubmit(e)}
        disabled={this.props.disabled}
        cancelText={sendStage === SEND_STAGES.EDIT ? t('reject') : t('cancel')}
        submitText={submitText}
      />
    );
  }
}
