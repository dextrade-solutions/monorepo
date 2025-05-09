import {
  Alert,
  Box,
  Button,
  TextField,
  TextareaAutosize,
  Typography,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  isRequired,
  luhnCheck,
  maxLen,
  phone,
  humanizePaymentMethodName,
} from 'dex-helpers';
import { DextradeTypes, paymentService } from 'dex-services';
import { Edit } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Autocomplete } from '../../ui';
import PaymentMethodExpanded from '../payment-method-expanded';

const PAYMENT_METHOD_FORM_FIELDS = {
  TEXT_AREA: TextareaAutosize,
  TEXT_FIELD: TextField,
  IMAGE: TextField, // file field
};

const CONTENT_TYPE_VALIDATORS = {
  IBAN_OR_CARD_NUMBER: [luhnCheck],
  ADDITIONAL_INFO: [maxLen(100)],
  PHONE: [phone],
};

interface FieldProviderProps {
  label: string;
  name: string;
  validators: ((value: any) => string | null)[];
  onChange: (name: string, value: any, errors: string[] | null) => void;
  renderInput: (onChange: (value: any) => void) => React.ReactNode;
}

const FieldProvider = ({
  label,
  name,
  validators,
  onChange,
  renderInput,
}: FieldProviderProps) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<string[]>([]);
  const handleChange = (v: any) => {
    const targetName = name;
    const targetValue = v?.target ? v.target.value : v;

    const foundErrors = validators.reduce((acc: string[], validate) => {
      const error = (validate(targetValue) || '').replace('{v}', t('field'));
      return error ? [...acc, error] : acc;
    }, []);
    setErrors(foundErrors);

    onChange(
      targetName,
      targetValue,
      foundErrors.length > 0 ? foundErrors : null,
    );
  };
  return (
    <Box marginTop={2} marginBottom={2}>
      <Typography marginBottom={1} color="text.secondary">
        {label}
      </Typography>
      {renderInput(handleChange)}
      {Boolean(errors.length) && <Typography>{errors.join(',')}</Typography>}
    </Box>
  );
};

interface PaymentMethodFormProps {
  value?: DextradeTypes.PaymentMethodsModel[];
  currency?: string | null;
  onCreated?: (
    v: DextradeTypes.PaymentMethodsModel[],
    updatedAll: boolean,
  ) => void;
  onChoosePaymentMethod?: (v: DextradeTypes.PaymentMethodsModel) => void;
  paymentMethodCurrencies?: () => Promise<DextradeTypes.CurrencyModel[]>;
  paymentMethodList?: () => Promise<DextradeTypes.PaymentMethodModel[]>;
  paymentMethods: DextradeTypes.BankDictModel[];
  paymentMethodCreateOrUpdate?: (
    data: any,
  ) => Promise<{ data: DextradeTypes.PaymentMethodsModel[] }>;
}

export const PaymentMethodForm = ({
  value = [], // selected payment methods
  currency = null,
  paymentMethods,
  onCreated,
  onChoosePaymentMethod,
  paymentMethodCurrencies,
  paymentMethodCreateOrUpdate = (data) =>
    paymentService.save(data, { method: data.id ? 'PUT' : 'POST' }),
}: PaymentMethodFormProps) => {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<any>({
    currency,
    selectedPaymentMethods: value,
  });
  const [edit, setEdit] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    DextradeTypes.BankDictModel | undefined
  >();
  const [isMounted, setIsMounted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | null>>({});
  const [saving, setSaving] = useState(false);

  const { isLoading: currenciesLoading, data: currencies = [] } = useQuery({
    queryKey: ['paymentMethodsCurrencies'],
    queryFn: (params) => {
      if (paymentMethodCurrencies) {
        return paymentMethodCurrencies(params);
      }
      return paymentService.listAllCurrency().then((r) => r.data);
    },
  });

  const defaultCurrency = formValues.currency || currencies[0]?.iso || 'THB';

  const handleOnChange = (
    targetName: string,
    targetValue: any,
    foundErrors: string[] | null,
  ) => {
    const forUpdate = {
      [targetName]: targetValue,
    };
    const newFormValues = { ...formValues, ...forUpdate };
    setFormValues(newFormValues);
    setErrors({
      ...errors,
      [targetName]: foundErrors,
    });
  };

  const confirmChoosePaymentMethod = () => {
    if (paymentMethod) {
      handleOnChange(
        'selectedPaymentMethods',
        [...(formValues.selectedPaymentMethods || []), paymentMethod],
        null,
      );
      onChoosePaymentMethod &&
        onChoosePaymentMethod(paymentMethod.userPaymentMethod);
      setPaymentMethod(undefined);
    }
  };
  const handleSetCurrentPaymentMethod = useCallback(
    (method: DextradeTypes.BankDictModel) => {
      setPaymentMethod(method);
      if (method.userPaymentMethod) {
        try {
          const parsedData = JSON.parse(method.userPaymentMethod.data);
          setFormValues({
            ...formValues,
            ...parsedData,
            userPaymentMethodId: method.userPaymentMethod.userPaymentMethodId,
            paymentMethod: method,
          });
        } catch (e) {
          console.error('Error parsing userPaymentMethod.data', e);
        }
      } else {
        setEdit(true);
      }
    },
    [formValues, setFormValues],
  );

  useEffect(() => {
    if (!isMounted && defaultCurrency && paymentMethods.length) {
      if (paymentMethods.length === 1) {
        const [method] = paymentMethods;
        if (method.fields.length > 0 && !method.userPaymentMethod) {
          handleSetCurrentPaymentMethod(paymentMethods[0]);
        }
      }
      setIsMounted(true);
    }
  }, [
    isMounted,
    formValues,
    paymentMethods,
    handleSetCurrentPaymentMethod,
    defaultCurrency,
  ]);

  const save = async () => {
    try {
      setSaving(true);

      const paymentMethodsPayload = (
        formValues.selectedPaymentMethods || []
      ).map((p: DextradeTypes.BankDictModel) => ({
        id: formValues.userPaymentMethodId,
        balanceIsRequired: false,
        paymentMethod: p,
        currency: { iso: formValues.currency },
      }));

      if (paymentMethod) {
        const newFields = (paymentMethod.fields || []).map((field) => {
          const formFieldName = `${field.contentType}:${field.id}`;
          return {
            ...field,
            value: formValues[formFieldName],
          };
        });

        paymentMethodsPayload.push({
          balanceIsRequired: false,
          paymentMethod: {
            ...paymentMethod,
            fields: newFields,
          },
          currency: { iso: formValues.currency },
        });
      }

      const payload = {
        paymentMethods: paymentMethodsPayload,
      };

      const result = await paymentMethodCreateOrUpdate(payload);
      onCreated && onCreated(result.data, !paymentMethod);
      confirmChoosePaymentMethod();
    } catch (error) {
      console.error('Error saving payment method:', error);
      // Handle error, e.g., show an error message to the user
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return !Object.values(errors).some((err) => err !== null && err.length > 0);
  };

  const renderSaveBtn = () => {
    const btnText = paymentMethod ? t('Save') : t('Confirm');
    return (
      <Button
        fullWidth={!paymentMethod}
        variant="contained"
        className="bank-account-picker__save-btn"
        disabled={!isFormValid() || saving}
        onClick={save}
      >
        {saving ? <CircularProgress size={24} color="inherit" /> : btnText}
      </Button>
    );
  };

  return (
    <Box>
      {!paymentMethod && (
        <>
          {!currency && (
            <FieldProvider
              name="currency"
              validators={[isRequired]}
              label={t('currency')}
              renderInput={(onChangeWrapper) => (
                <Autocomplete
                  value={formValues.currency || defaultCurrency}
                  onChange={(_, v) => onChangeWrapper(v.iso)}
                  options={currencies}
                  disabled={Boolean(currency) || currenciesLoading}
                  fullWidth
                  isOptionEqualToValue={(option, v) => option.iso === v}
                  getOptionLabel={(option) =>
                    option.iso ? `${option.iso} (${option.name})` : option
                  }
                  renderInput={(props) => <TextField {...props} />}
                />
              )}
              onChange={handleOnChange}
            />
          )}
          <FieldProvider
            name="selectedPaymentMethods"
            validators={[isRequired]}
            label="Choose payment methods"
            renderInput={(onChangeWrapper) => (
              <Autocomplete
                paper
                multiple
                disableSearch
                value={formValues.selectedPaymentMethods}
                renderOption={(_, option, { selected }) => (
                  <Box
                    width="100%"
                    display="flex"
                    alignItems="center"
                    overflow="hidden"
                  >
                    <Box
                      sx={{
                        minWidth: 4,
                        minHeight: '100%',
                        bgcolor: 'primary.main',
                        my: 0.5,
                        borderRadius: 1,
                        opacity: 0.5,
                        alignSelf: 'stretch',
                      }}
                      marginRight={2}
                    />
                    {option.userPaymentMethod && !selected ? (
                      <PaymentMethodExpanded
                        name={option.userPaymentMethod.paymentMethod.name}
                        fields={option.userPaymentMethod.paymentMethod.fields}
                        nocopy
                      />
                    ) : (
                      <Typography>{option.name}</Typography>
                    )}
                  </Box>
                )}
                onChange={(isDeletion, v = []) => {
                  const method = v[v.length - 1];
                  if (
                    v.length === 0 ||
                    method.fields.length === 0 ||
                    method.userPaymentMethod ||
                    isDeletion
                  ) {
                    onChangeWrapper(v);
                  } else {
                    handleSetCurrentPaymentMethod(method);
                  }
                }}
                options={paymentMethods}
                fullWidth
                getOptionLabel={(option) =>
                  humanizePaymentMethodName(option.name, t)
                }
                renderInput={(props) => <TextField {...props} />}
              />
            )}
            onChange={handleOnChange}
          />
        </>
      )}

      {paymentMethod && (
        <Box>
          <Typography>{paymentMethod.name}</Typography>
          {paymentMethod.fields.map((field: any) => {
            const Field = PAYMENT_METHOD_FORM_FIELDS[field.fieldType];
            const fieldValidators: ((value: any) => string | null)[] = [];
            if (field.required) {
              fieldValidators.push(isRequired);
            }
            if (field.validate) {
              const validators =
                CONTENT_TYPE_VALIDATORS[field.contentType] || [];
              fieldValidators.push(...validators);
            }
            const fieldName = `${field.contentType}:${field.id}`;
            const fieldLabel = field.name || t(field.contentType);
            const fieldValue = formValues[fieldName];
            return (
              <FieldProvider
                key={field.id}
                name={fieldName}
                validators={fieldValidators}
                label={fieldLabel}
                onChange={handleOnChange}
                renderInput={(onChangeWrapper) => (
                  <Field
                    value={fieldValue}
                    onChange={onChangeWrapper}
                    base64
                    fullWidth
                  />
                )}
              />
            );
          })}
          <Alert severity="info">{t('paymentMethodHint')}</Alert>
          <Box display="flex" marginTop={3}>
            <Button onClick={() => setPaymentMethod(undefined)}>Cancel</Button>
            <div className="flex-grow" />
            {renderSaveBtn()}
          </Box>
        </Box>
      )}

      {Boolean(
        !paymentMethod && formValues.selectedPaymentMethods?.length > 0,
      ) && <Box>{renderSaveBtn()}</Box>}
    </Box>
  );
};
