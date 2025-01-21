import {
  Alert,
  AlertProps,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material';
import React, { Component, ReactNode } from 'react';

import { ModalProps } from '../types';

class ConfirmModal extends Component<
  {
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    cancelBtnText?: string;
    confirmBtnText?: string;
    onConfirm: () => void | Promise<void>;
  } & ModalProps &
    AlertProps
> {
  static defaultProps = {
    severity: 'info',
    title: 'Confirmation',
    description: 'Are you sure you want to confirm this action?',
    cancelBtnText: 'Cancel',
    confirmBtnText: 'Confirm',
  };

  render(): ReactNode {
    return (
      <Card sx={{ p: 2 }}>
        <CardHeader title={this.props.title} />
        <CardContent>
          <Typography color="text.secondary">{this.props.description}</Typography>
        </CardContent>
        <CardActions>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Button onClick={this.props.hideModal}>
              {this.props.cancelBtnText}
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={async () => {
                await this.props.onConfirm();
                this.props.hideModal();
              }}
            >
              {this.props.confirmBtnText}
            </Button>
          </Box>
        </CardActions>
      </Card>
    );
  }
}

export default ConfirmModal;
