import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text } from '../../component-library';
import {
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';

class SelectedAccount extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  render() {
    const { t } = this.context;
    return (
      <Text
        className="selected-account"
        variant={TextVariant.bodySm}
        color={TextColor.textAlternative}
      >
        {t('walletActions')}
      </Text>
    );
  }
}

export default SelectedAccount;
