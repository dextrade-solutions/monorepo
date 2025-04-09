import { Box, Divider } from '@mui/material';
import { AssetModel, UserPaymentMethod } from 'dex-helpers/types';
import { AssetItem, ButtonIcon } from 'dex-ui';
import { useTranslation } from 'react-i18next';

import PaymentMethods from '../../payment-methods';
import { ModalProps } from '../types';

const SetPaymentMethod = ({
  asset,
  value,
  supportedIdsList,
  onChange,
  hideModal,
}: {
  asset: AssetModel;
  value: UserPaymentMethod | null;
  supportedIdsList?: number[];
  onChange: (v: UserPaymentMethod) => void;
} & ModalProps) => {
  const { t } = useTranslation();

  const selectPaymentMethod = (v: UserPaymentMethod) => {
    onChange(v);
    hideModal();
  };

  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <AssetItem asset={asset} />

        <ButtonIcon
          iconName="close"
          color="secondary"
          size="sm"
          onClick={hideModal}
          ariaLabel={t('close')}
        />
      </Box>

      <Box marginY={1}>
        <Divider />
      </Box>
      <PaymentMethods
        value={value}
        selectable
        multiselect
        supportedIdsList={supportedIdsList}
        currency={asset.symbol}
        onSelect={selectPaymentMethod}
      />
    </Box>
  );
};

export default SetPaymentMethod;
