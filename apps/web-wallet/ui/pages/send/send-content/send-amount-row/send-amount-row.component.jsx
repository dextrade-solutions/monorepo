import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SendRowWrapper from '../send-row-wrapper';
import UserPreferencedCurrencyInput from '../../../../components/app/user-preferenced-currency-input';
import { AssetType } from '../../../../../shared/constants/transaction';
import AmountMaxButton from './amount-max-button';

export default class SendAmountRow extends Component {
  static propTypes = {
    amount: PropTypes.string,
    inError: PropTypes.bool,
    asset: PropTypes.object,
    updateSendAmount: PropTypes.func,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  handleChange = (newAmount) => {
    this.props.updateSendAmount(newAmount);
  };

  renderInput() {
    const { amount, inError, asset } = this.props;

    return (
      <UserPreferencedCurrencyInput
        error={inError}
        onChange={this.handleChange}
        assetInstance={asset}
        hexValue={amount}
      />
    );
  }

  render() {
    const { inError, asset } = this.props;

    if (asset.type === AssetType.NFT) {
      return null;
    }

    return (
      <SendRowWrapper
        label={`${this.context.t('amount')}:`}
        showError={inError}
        errorType="amount"
      >
        <AmountMaxButton inError={inError} />
        {this.renderInput()}
      </SendRowWrapper>
    );
  }
}
