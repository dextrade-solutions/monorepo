import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import UnitInput from '../unit-input';
import CurrencyDisplay from '../currency-display';

import { addHexPrefix } from '../../../../app/scripts/lib/util';
import { Numeric } from '../../../../shared/modules/Numeric';

/**
 * Component that allows user to enter token values as a number, and props receive a converted
 * hex value. props.value, used as a default or forced value, should be a hex value, which
 * gets converted into a decimal value.
 */
export default class TokenInput extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    dataTestId: PropTypes.string,
    currentCurrency: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.string,
    showFiat: PropTypes.bool,
    hideConversion: PropTypes.bool,
    token: PropTypes.shape({
      provider: PropTypes.object.isRequired,
      account: PropTypes.string,
      balance: PropTypes.string,
      symbol: PropTypes.string,
      decimals: PropTypes.number,
    }).isRequired,
    tokenExchangeRates: PropTypes.object,
    tokens: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);

    const { value: hexValue } = props;
    const decimalValue = hexValue ? this.getValue(props) : 0;

    this.state = {
      decimalValue,
      hexValue,
    };
  }

  componentDidUpdate(prevProps) {
    const { value: prevPropsHexValue } = prevProps;
    const { value: propsHexValue } = this.props;
    const { hexValue: stateHexValue } = this.state;

    if (
      prevPropsHexValue !== propsHexValue &&
      propsHexValue !== stateHexValue
    ) {
      const decimalValue = this.getValue(this.props);
      this.setState({ hexValue: propsHexValue, decimalValue });
    }
  }

  getValue(props) {
    const { value: hexValue, token: { decimals, symbol } = {} } = props;

    const multiplier = Math.pow(10, Number(decimals || 0));
    const decimalValueString = new Numeric(addHexPrefix(hexValue), 16)
      .toBase(10)
      .applyConversionRate(symbol ? multiplier : 1, true)
      .toString();

    return Number(decimalValueString) ? decimalValueString : '';
  }

  handleChange = (decimalValue, applyDecimals = false) => {
    const { token: { decimals } = {}, onChange } = this.props;

    let newDecimalValue = decimalValue;

    if (decimals && decimalValue && applyDecimals) {
      newDecimalValue = new BigNumber(decimalValue, 10).toFixed(decimals);
    }

    const hexValue = new Numeric(newDecimalValue || 0, 10)
      .times(Math.pow(10, Number(decimals || 0)), 10)
      .toBase(16)
      .toString();
    this.setState({ hexValue, decimalValue });
    onChange(hexValue);
  };

  handleBlur = (decimalValue) => {
    this.handleChange(decimalValue, true);
  };

  renderConversionComponent() {
    const { currentCurrency, hideConversion, token } = this.props;

    // const existingToken = tokens.find(({ address }) =>
    //   isEqualCaseInsensitive(address, token.address),
    // );
    // const tokenExchangeRate = tokenExchangeRates?.[existingToken?.address] ?? 0;
    // let currency, numberOfDecimals;
    // const tokenExchangeRate = false;
    // if (tokenExchangeRate) {
    //   const decimalEthValue = decimalValue * tokenExchangeRate || 0;

    //   const hexWeiValue = getWeiHexFromDecimalValue({
    //     value: decimalEthValue,
    //     fromCurrency: EtherDenomination.ETH,
    //     fromDenomination: EtherDenomination.ETH,
    //   });

    //   if (showFiat) {
    //     // Display Fiat
    //     currency = currentCurrency;
    //     numberOfDecimals = 2;
    //   } else {
    //     // Display ETH
    //     currency = EtherDenomination.ETH;
    //     numberOfDecimals = 6;
    //   }
    //   return (
    //     <CurrencyDisplay
    //       className="currency-input__conversion-component"
    //       currency={currency}
    //       value={hexWeiValue}
    //       provider={token.provider}
    //       numberOfDecimals={numberOfDecimals}
    //     />
    //   );
    // }

    if (hideConversion) {
      return (
        <div className="currency-input__conversion-component">
          {this.context.t('noConversionRateAvailable')}
        </div>
      );
    }
    const { hexValue } = this.state;
    return (
      <CurrencyDisplay
        className="currency-input__conversion-component"
        currency={currentCurrency}
        value={hexValue}
        ticker={token.symbol}
        shiftBy={token.decimals}
      />
    );
  }

  render() {
    const { token, ...restProps } = this.props;
    const { decimalValue } = this.state;

    return (
      <UnitInput
        {...restProps}
        suffix={token.symbol}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        value={decimalValue}
      >
        {this.renderConversionComponent()}
      </UnitInput>
    );
  }
}
