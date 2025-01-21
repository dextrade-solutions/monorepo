import { Alert, AlertProps, Box, Button, Typography } from '@mui/material';
import { Component, ReactNode } from 'react';

import { ModalProps } from '../types';

class AlertModal extends Component<
  {
    text: string;
  } & ModalProps &
    AlertProps
> {
  render(): ReactNode {
    return (
      <Box padding={3}>
        <Alert severity={this.props.severity}>
          <Typography fontWeight="bold">Error</Typography>
          {this.props.text}
        </Alert>
        <Box marginTop={1}>
          <Button onClick={this.props.hideModal}>Close</Button>
        </Box>
      </Box>
    );
  }
}

export default AlertModal;
