import React from 'react';

import { ModalProps } from './types';
import { QRCode } from '../../ui';

export default function QrModal(
  qrCodeProps: { value: string; description: string } & ModalProps,
) {
  return <QRCode mt={3} p={2} size={350} {...qrCodeProps} />;
}
