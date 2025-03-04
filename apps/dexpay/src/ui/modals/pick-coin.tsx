import { Box } from '@mui/material';
import { ModalProps } from 'dex-ui';
import React from 'react';

import PickCoin from '../components/ui/PickCoin';

interface PickCoinModalProps {
  value: string;
  onChange: (v: string) => void;
}

const PickCoinModal: React.FC<PickCoinModalProps & ModalProps> = ({
  value,
  hideModal,
  onChange,
}) => {
  const handleSelect = (v: string) => {
    onChange(v);
    hideModal();
  };
  return (
    <Box padding={3}>
      <PickCoin value={value} onChange={handleSelect} />
    </Box>
  );
};

export default PickCoinModal;
