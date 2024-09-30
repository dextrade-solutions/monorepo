import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { getMyPaymentMethods } from '../../../selectors';
import PaymentMethodForm from '../../../components/app/p2p/bank-account-form';
import { P2P_CONFIG_ROUTE } from '../../../helpers/constants/routes';

class P2PPaymentAdd extends Component {
  static propTypes = {
    bankAccount: PropTypes.object,
    history: PropTypes.object,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  render() {
    const { bankAccount, history } = this.props;

    return (
      <PaymentMethodForm
        edit={bankAccount}
        onCancel={() => history.push(P2P_CONFIG_ROUTE)}
        onCreated={() => history.push(P2P_CONFIG_ROUTE)}
      />
    );
  }
}

export default compose(
  withRouter,
  connect((state, ownProps) => {
    const { id } = ownProps.match.params;
    const bankAccounts = getMyPaymentMethods(state);
    const bankAccount = id
      ? bankAccounts.find((i) => i.userPaymentMethodId === Number(id))
      : null;
    if (bankAccount) {
      const parsedBankAccount = { ...bankAccount };
      parsedBankAccount.currency = bankAccount.currency.iso;
      Object.entries(JSON.parse(bankAccount.data)).forEach(
        ([fieldName, value]) => {
          parsedBankAccount[`paymentMethodFields.${fieldName}`] = value;
        },
      );
      return {
        bankAccount: parsedBankAccount,
      };
    }
    return {
      bankAccount: null,
    };
  }),
)(P2PPaymentAdd);
