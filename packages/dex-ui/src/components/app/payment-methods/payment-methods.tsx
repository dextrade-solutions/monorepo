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
import { DextradeTypes, paymentService } from 'dex-services';
import React, { useState } from 'react';

// import { UserPaymentMethod } from '../../../../app/types/dextrade';
// import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTranslation } from 'react-i18next';

import Icon from '../../ui/icon';
import PaymentMethodForm from '../payment-method-form';

interface IProps {
  value?: DextradeTypes.PaymentMethodsModel;
  currency: string;
  onSelect: (paymentMethod: DextradeTypes.PaymentMethodsModel) => void;
  onClose: () => void;
  removePaymentMethod?: (id: number) => Promise<any>;
  getUserPaymentMethods?: () => Promise<any>;
}

export const PaymentMethods = ({
  value,
  currency,
  onSelect,
  onClose,
  removePaymentMethod = (id) => paymentService.delete1({ id }),
  getUserPaymentMethods = () => paymentService.listAll1().then((r) => r.data),
}: IProps) => {
  const { t } = useTranslation();
  const [createMode, setCreateMode] = useState(false);

  const toggleCreateMode = () => {
    setCreateMode(!createMode);
  };

  const {
    isLoading,
    data: paymentMethods = [],
    refetch,
  } = useQuery({
    queryKey: ['userPaymentMethods'],
    queryFn: getUserPaymentMethods,
  });

  const onCreated = async () => {
    await refetch();
    toggleCreateMode();
  };

  const remove = async (id: number) => {
    await removePaymentMethod(id);
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
