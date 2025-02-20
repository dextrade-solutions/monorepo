import { Box } from '@mui/material';
import { AssetModel } from 'dex-helpers/types';
import React from 'react';

import { useGlobalModalContext } from './modal-context';
import { ModalProps } from './types';
import { SelectCoinsItemDropdown } from '../../ui/select-coins/select-coins-item-dropdown';

export default function AssetSelect({
  value,
  title = 'Pick asset',
  items = [],
  maxListItem = 6,
  onChange,
}: {
  value: AssetModel;
  items: AssetModel[];
  maxListItem?: number;
  title?: string;
  onChange: (v: AssetModel) => void;
} & ModalProps) {
  const { hideModal } = useGlobalModalContext();
  return (
    <Box p={2}>
      <SelectCoinsItemDropdown
        placeholderInput={'Search name or contract address'}
        onClose={hideModal}
        onChange={onChange}
        value={value}
        items={items}
        title={title}
        maxListItem={maxListItem}
      />
    </Box>
  );
}
