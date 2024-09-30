import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import CurrencyInput from '../currency-input';

export default class UserPreferencedCurrencyInput extends PureComponent {
  static propTypes = {
    useNativeCurrencyAsPrimaryCurrency: PropTypes.bool,
    sendInputCurrencySwitched: PropTypes.bool,
  };

  render() {
    const {
      useNativeCurrencyAsPrimaryCurrency,
      sendInputCurrencySwitched,
      ...restProps
    } = this.props;

    const featureSecondary = Boolean(
      (useNativeCurrencyAsPrimaryCurrency && sendInputCurrencySwitched) ||
        (!useNativeCurrencyAsPrimaryCurrency && !sendInputCurrencySwitched),
    );

    return <CurrencyInput {...restProps} featureSecondary={featureSecondary} />;
  }
}
