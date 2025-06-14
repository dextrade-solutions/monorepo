import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from '../../components/ui/button';
import { EVENT, EVENT_NAMES } from '../../../shared/constants/metametrics';
import { getAccountNameErrorMessage } from '../../helpers/utils/accounts';

export default class NewAccountCreateForm extends Component {
  static defaultProps = {
    newAccountNumber: 0,
  };

  state = {
    newAccountName: '',
    defaultAccountName: this.context.t('newWalletNumberName', [
      this.props.newAccountNumber,
    ]),
  };

  render() {
    const { newAccountName, defaultAccountName } = this.state;
    const { history, createAccount, mostRecentOverviewPage, accounts } =
      this.props;

    const createClick = (event) => {
      event.preventDefault();
      createAccount(newAccountName || defaultAccountName)
        .then(() => {
          this.context.trackEvent({
            category: EVENT.CATEGORIES.ACCOUNTS,
            event: EVENT_NAMES.ACCOUNT_ADDED,
            properties: {
              account_type: EVENT.ACCOUNT_TYPES.DEFAULT,
            },
          });
          history.push(mostRecentOverviewPage);
        })
        .catch((e) => {
          this.context.trackEvent({
            category: EVENT.CATEGORIES.ACCOUNTS,
            event: EVENT_NAMES.ACCOUNT_ADD_FAILED,
            properties: {
              account_type: EVENT.ACCOUNT_TYPES.DEFAULT,
              error: e.message,
            },
          });
        });
    };

    const { isValidAccountName, errorMessage } = getAccountNameErrorMessage(
      accounts,
      this.context,
      newAccountName,
      defaultAccountName,
    );

    return (
      <div className="new-account-create-form">
        <div className="new-account-create-form__input-label">
          {this.context.t('walletName')}
        </div>
        <div>
          <input
            className={classnames({
              'new-account-create-form__input': true,
              'new-account-create-form__input__error': !isValidAccountName,
            })}
            value={newAccountName}
            placeholder={defaultAccountName}
            onChange={(event) =>
              this.setState({ newAccountName: event.target.value })
            }
            autoFocus
          />
          <div className="new-account-create-form__error new-account-create-form__error-amount">
            {errorMessage}
          </div>
          <div className="new-account-create-form__buttons">
            <Button
              type="secondary"
              large
              className="new-account-create-form__button"
              onClick={() => history.push(mostRecentOverviewPage)}
            >
              {this.context.t('cancel')}
            </Button>
            <Button
              type="primary"
              large
              className="new-account-create-form__button"
              onClick={createClick}
              disabled={!isValidAccountName}
            >
              {this.context.t('create')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

NewAccountCreateForm.propTypes = {
  createAccount: PropTypes.func,
  newAccountNumber: PropTypes.number,
  history: PropTypes.object,
  mostRecentOverviewPage: PropTypes.string.isRequired,
  accounts: PropTypes.array,
};

NewAccountCreateForm.contextTypes = {
  t: PropTypes.func,
  trackEvent: PropTypes.func,
};
