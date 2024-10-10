import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  getStrPaymentMethodInstance,
  humanizePaymentMethodName,
} from 'dex-helpers';
import { UserPaymentMethod } from 'dex-helpers/types';
import { Icon } from 'dex-ui';
import { useState } from 'react';

import P2PService from '../../../../app/services/p2p-service';
import { useI18nContext } from '../../../hooks/useI18nContext';
import PaymentMethodForm from '../p2p-payment-method-form';

interface IProps {
  value?: UserPaymentMethod;
  currency: string;
  onSelect: (paymentMethod: UserPaymentMethod) => void;
  onClose?: () => void;
}

export const PaymentMethods = ({
  value,
  currency,
  onSelect,
  onClose,
}: IProps) => {
  const t = useI18nContext();
  const [createMode, setCreateMode] = useState(false);

  const toggleCreateMode = () => {
    setCreateMode(!createMode);
  };

  const {
    isLoading,
    data: paymentMethods = [],
    refetch,
  } = useQuery<UserPaymentMethod[]>({
    queryKey: ['userPaymentMethods'],
    queryFn: () =>
      P2PService.userPaymentMethods().then((response) => response.data),
  });

  const onCreated = async () => {
    await refetch();
    toggleCreateMode();
  };

  const remove = async (id: number) => {
    await P2PService.paymentMethodDelete(id);
    refetch();
  };

  const onChangeHandler = (e) => {
    const item = paymentMethods.find(
      ({ userPaymentMethodId }) =>
        userPaymentMethodId === Number(e.target.value),
    );
    if (item) {
      onSelect(item);
      onClose && onClose();
    }
  };
  return (
    <Box>
      <Box display="flex" alignItems="center" marginBottom={2}>
        {createMode && (
          <Button
            startIcon={<Icon name="arrow-left-dex" />}
            color="secondary"
            onClick={() => setCreateMode(false)}
          >
            Back
          </Button>
        )}
      </Box>
      {/* <Typography variant="body2" textAlign="center" color="text.secondary">
        Please, choose or create a new payment method
      </Typography> */}
      {createMode ? (
        <Box>
          <PaymentMethodForm currency={currency} onCreated={onCreated} />
        </Box>
      ) : (
        <Box marginTop={2}>
          <FormControl fullWidth>
            <RadioGroup
              value={value?.userPaymentMethodId}
              onChange={onChangeHandler}
            >
              {paymentMethods.map((bankAccount) => (
                <Box
                  key={bankAccount.userPaymentMethodId}
                  display="flex"
                  justifyContent="space-between"
                  marginBottom={2}
                >
                  <FormControlLabel
                    value={bankAccount.userPaymentMethodId}
                    control={<Radio color="primary" />}
                    label={
                      <Box>
                        <Typography>
                          {humanizePaymentMethodName(
                            bankAccount.paymentMethod.name,
                            t,
                          )}
                        </Typography>
                        <Typography color="text.secondary">
                          {getStrPaymentMethodInstance(bankAccount)}
                        </Typography>
                      </Box>
                    }
                  />
                  {value !== bankAccount && (
                    <Button
                      onClick={() => remove(bankAccount.userPaymentMethodId)}
                    >
                      <Icon name="trash-dex" size="lg" />
                    </Button>
                  )}
                </Box>
              ))}
            </RadioGroup>
          </FormControl>
          {paymentMethods.length === 0 && !isLoading && (
            <Box marginBottom={4}>
              <Alert severity="info">
                You haven't added payment methods yet.
              </Alert>
            </Box>
          )}
          {isLoading && <Box>Loading...</Box>}
          <Box marginTop={1}>
            <Button variant="outlined" onClick={toggleCreateMode} fullWidth>
              <Box display="flex" alignItems="center">
                <Typography>{t('add')}</Typography>
              </Box>
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
