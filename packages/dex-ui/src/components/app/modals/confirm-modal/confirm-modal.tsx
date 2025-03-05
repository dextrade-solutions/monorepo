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
import { useTranslation, WithTranslation, withTranslation } from 'react-i18next';

import { ModalProps } from '../types';

interface ConfirmModalProps {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  cancelBtnText?: string;
  confirmBtnText?: string;
  onConfirm: () => void | Promise<void>;
}

type Props = ConfirmModalProps & ModalProps & AlertProps & WithTranslation;

class ConfirmModal extends Component<Props> {
  render(): ReactNode {
    return (
      <Card sx={{ p: 2 }}>
        <CardHeader title={this.props.title} />
        <CardContent>
          <Typography color="text.secondary">
            {this.props.description || this.props.t('confirmAction')}
          </Typography>
        </CardContent>
        <CardActions>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Button onClick={this.props.hideModal}>
              {this.props.cancelBtnText || this.props.t('cancel')}
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={async () => {
                await this.props.onConfirm();
                this.props.hideModal();
              }}
            >
              {this.props.confirmBtnText || this.props.t('confirm')}
            </Button>
          </Box>
        </CardActions>
      </Card>
    );
  }
}

export default withTranslation()(ConfirmModal);
