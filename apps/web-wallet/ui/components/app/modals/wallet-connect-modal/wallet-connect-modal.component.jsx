import React, { Component } from 'react';
import PropTypes from 'prop-types';
import QrScanner from '../qr-scanner';
import Box from '../../../ui/box';

import { Size, TEXT_ALIGN } from '../../../../helpers/constants/design-system';
import TextField from '../../../ui/text-field';
import Button from '../../../ui/button';
import { Text } from '../../../component-library';

export default class WalletConnectModal extends Component {
  static propTypes = {
    walletConnect: PropTypes.func,
    callback: PropTypes.func,
    hideModal: PropTypes.func,
  };

  state = {
    wcUri: null,
    loading: false,
  };

  handleUriInput({ target }) {
    this.setState({ wcUri: target.value });
  }

  qrCodeDetected(data) {
    if (data) {
      this.setState({ wcUri: data.values.address });
      this.walletConnect();
    }
  }

  async walletConnect() {
    this.setState({ loading: true });
    const requestId = await this.props.walletConnect({
      wcUri: this.state.wcUri,
    });
    this.props.hideModal();
    if (this.props.callback) {
      this.props.callback(requestId);
    }
    this.setState({ loading: false });
  }

  render() {
    return (
      <Box className="wallet-connect-modal">
        <QrScanner
          qrCodeDetected={(qrCodeData) => this.qrCodeDetected(qrCodeData)}
        />
        <Text marginTop={2} textAlign={TEXT_ALIGN.CENTER}>
          Or
        </Text>
        <Box padding={4}>
          <TextField
            autoFocus
            value={this.state.wcUri}
            placeholder="Paste uri"
            endAdornment={
              <Button
                className="connect-btn"
                type="primary"
                size={Size.SM}
                disabled={!this.state.wcUri || this.state.loading}
                onClick={() => this.walletConnect()}
              >
                Connect
              </Button>
            }
            onChange={(e) => this.handleUriInput(e)}
          />
        </Box>
      </Box>
    );
  }
}
