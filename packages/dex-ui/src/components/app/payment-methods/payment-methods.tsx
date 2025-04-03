import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  Typography,
  Skeleton,
  FormGroup,
  RadioGroup,
  Radio,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  getStrPaymentMethodInstance,
  humanizePaymentMethodName,
} from 'dex-helpers';
import { DextradeTypes, paymentService } from 'dex-services';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Icon from '../../ui/icon';
import PaymentMethodForm from '../payment-method-form';

interface IProps {
  value?: DextradeTypes.PaymentMethodsModel[]; // Now always an array
  currency: string;
  supportedIdsList?: number[];
  onSelect: (userPaymentMethods: DextradeTypes.PaymentMethodsModel[]) => void; // Now always an array
  onClose: () => void;
  removePaymentMethod?: (id: number) => Promise<any>;
  getUserPaymentMethods?: () => Promise<any>;
  selectable?: boolean;
  multiselect: boolean;
}

const PaymentMethods = ({
  value = [],
  currency,
  supportedIdsList,
  multiselect = false,
  selectable = false,
  onSelect,
  onClose,
  removePaymentMethod = (id) => paymentService.delete1({ id }),
  getUserPaymentMethods = () => paymentService.listAll1().then((r) => r.data),
}: IProps) => {
  const { t } = useTranslation();
  const [createMode, setCreateMode] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    DextradeTypes.PaymentMethodsModel[]
  >([]); // Now always an array

  const paymentMethodsQuery = useQuery({
    queryKey: ['paymentMethods', currency],
    queryFn: (params) => {
      const [, currencyParam] = params.queryKey;
      if (currencyParam) {
        return paymentService
          .listAllBankByCurrencyId(currencyParam)
          .then((r) => r.data);
      }
      return paymentService.listAllBanks().then((r) => r.data);
    },
  });

  const toggleCreateMode = () => {
    setCreateMode(!createMode);
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['userPaymentMethods'],
    queryFn: getUserPaymentMethods,
  });

  const userPaymentMethods = useMemo(() => {
    let result: DextradeTypes.PaymentMethodsModel[] = data || [];
    if (supportedIdsList) {
      result = result.filter((item) =>
        supportedIdsList.includes(item.paymentMethod?.paymentMethodId),
      );
    }
    return result;
  }, [data, supportedIdsList]);

  useEffect(() => {
    if (!isLoading && userPaymentMethods) {
      if (!userPaymentMethods.length) {
        setCreateMode(true);
      }
    }
  }, [userPaymentMethods, isLoading]);

  const onCreated = async (id: number) => {
    const updatesPaymentMethods = await refetch();
    const newPaymentMethod = updatesPaymentMethods.data.find(
      (item) => item.userPaymentMethodId === id,
    );
    if (newPaymentMethod) {
      setSelectedPaymentMethods([newPaymentMethod]);
    }
    toggleCreateMode();
  };

  const remove = async (id: number) => {
    await removePaymentMethod(id);
    refetch();
  };

  const onChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement>,
    paymentMethod: DextradeTypes.PaymentMethodsModel,
  ) => {
    if (multiselect) {
      const isChecked = e.target.checked;
      if (isChecked) {
        setSelectedPaymentMethods([...selectedPaymentMethods, paymentMethod]);
      } else {
        setSelectedPaymentMethods(
          selectedPaymentMethods.filter(
            (item) =>
              item.userPaymentMethodId !== paymentMethod.userPaymentMethodId,
          ),
        );
      }
    } else {
      setSelectedPaymentMethods([paymentMethod]); // Always set as an array
    }
  };

  useEffect(() => {
    if (value.length) {
      setSelectedPaymentMethods(value);
    }
  }, [value]);

  const renderPaymentMethodItem = (
    bankAccount: DextradeTypes.PaymentMethodsModel,
  ) => {
    return (
      <Box
        key={bankAccount.userPaymentMethodId}
        display="flex"
        justifyContent="space-between"
        marginBottom={2}
      >
        {selectable && (
          <FormControlLabel
            control={
              multiselect ? (
                <Checkbox
                  checked={selectedPaymentMethods.some(
                    (item) =>
                      item.userPaymentMethodId ===
                      bankAccount.userPaymentMethodId,
                  )}
                  onChange={(e) => onChangeHandler(e, bankAccount)}
                  color="primary"
                />
              ) : (
                <Radio
                  checked={selectedPaymentMethods.some(
                    (item) =>
                      item.userPaymentMethodId ===
                      bankAccount.userPaymentMethodId,
                  )}
                  onChange={(e) => onChangeHandler(e, bankAccount)}
                  color="primary"
                />
              )
            }
            label={
              <Box>
                <Typography>
                  {humanizePaymentMethodName(bankAccount.paymentMethod.name, t)}
                </Typography>
              </Box>
            }
          />
        )}
        {!selectable && (
          <>
            <Box>
              <Typography>
                {humanizePaymentMethodName(bankAccount.paymentMethod.name, t)}
              </Typography>
            </Box>
            <Button onClick={() => remove(bankAccount.userPaymentMethodId)}>
              <Icon name="trash-dex" size="lg" />
            </Button>
          </>
        )}
      </Box>
    );
  };

  const renderSkeleton = () => (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent="space-between"
          marginBottom={2}
        >
          <Skeleton width="80%" height={50} />
          <Skeleton variant="circular" width={30} height={30} />
        </Box>
      ))}
    </>
  );

  const paymentMethods = useMemo(() => {
    const excludedIdsList = userPaymentMethods.flatMap(
      (i) => i.paymentMethod?.paymentMethodId,
    );
    let result: DextradeTypes.BankDictModel[] = paymentMethodsQuery.data || [];
    if (supportedIdsList) {
      result = result.filter((item) =>
        supportedIdsList.includes(item.paymentMethodId),
      );
    }
    if (excludedIdsList) {
      result = result.filter(
        (item) => !excludedIdsList.includes(item.paymentMethodId),
      );
    }
    return result;
  }, [paymentMethodsQuery.data, supportedIdsList, userPaymentMethods]);

  if (isLoading && paymentMethodsQuery.isLoading) {
    return renderSkeleton();
  }

  return (
    <Box>
      {createMode ? (
        <Box>
          <PaymentMethodForm
            onCancel={() => setCreateMode(false)}
            paymentMethods={paymentMethods}
            currency={currency}
            onCreated={onCreated}
          />
        </Box>
      ) : (
        <Box marginTop={2}>
          <FormControl fullWidth>
            {multiselect ? (
              <FormGroup>
                {userPaymentMethods.map(renderPaymentMethodItem)}
              </FormGroup>
            ) : (
              <RadioGroup>
                {userPaymentMethods.map(renderPaymentMethodItem)}
              </RadioGroup>
            )}
          </FormControl>
          {userPaymentMethods.length === 0 && !isLoading && (
            <Box marginBottom={4}>
              <Alert severity="info">{t('noPaymentMethods')}</Alert>
            </Box>
          )}
          {paymentMethods.length > 0 && (
            <Box marginTop={1}>
              <Button variant="outlined" onClick={toggleCreateMode} fullWidth>
                <Box display="flex" alignItems="center">
                  <Typography>{t('addPaymentMethod')}</Typography>
                </Box>
              </Button>
            </Box>
          )}
          {selectable && (
            <Button
              sx={{ mt: 1 }}
              color="primary"
              fullWidth
              disabled={selectedPaymentMethods.length === 0}
              variant={
                selectedPaymentMethods.length === 0 ? 'text' : 'contained'
              }
              onClick={() => {
                onSelect(selectedPaymentMethods);
              }}
            >
              Continue
            </Button>
          )}
        </Box>
      )}
      {onClose && (
        <Button onClick={onClose} fullWidth>
          {t('close')}
        </Button>
      )}
    </Box>
  );
};

export default PaymentMethods;
