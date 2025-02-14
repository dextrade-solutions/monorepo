import React from 'react';

import { ModalProps } from './types';
import { QRCode } from '../../ui';

export default function AssetSelect({
  value,
  description,
}: { value: string; description: string } & ModalProps) {
  return <QRCode description={description} value={value} />;
}
