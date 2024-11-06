import '../styles.scss';
import { Box, Divider } from '@mui/material';
import { AssetModel, UserPaymentMethod } from 'dex-helpers/types';
import { AssetItem, ButtonIcon } from 'dex-ui';

import withModalProps from '../../../../helpers/hoc/with-modal-props';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import PaymentMethods from '../../payment-methods';
import { ModalProps } from '../types';

const SetPaymentMethod = ({
  asset,
  value,
  onChange,
  hideModal,
}: {
  asset: AssetModel;
  value: UserPaymentMethod | null;
  onChange: (v: UserPaymentMethod) => void;
} & ModalProps) => {
  const t = useI18nContext();

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
        currency={asset.symbol}
        onSelect={selectPaymentMethod}
      />
    </Box>
  );
};

const SetWalletComponent = withModalProps(SetPaymentMethod);

export default SetWalletComponent;
