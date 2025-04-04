import {
  Alert,
  Box,
  Button,
  TextField,
  TextareaAutosize,
  Typography,
  Grow,
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
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Autocomplete } from '../../ui';

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
  edit?: DextradeTypes.PaymentMethodsModel;
  currency?: string | null;
  onCancel?: () => void;
  onCreated?: () => void;
  paymentMethodCurrencies?: () => Promise<DextradeTypes.CurrencyModel[]>;
  paymentMethodList?: () => Promise<DextradeTypes.PaymentMethodModel[]>;
  paymentMethods: DextradeTypes.PaymentMethodsModel[];
  paymentMethodCreateOrUpdate?: (
    data: any,
  ) => Promise<DextradeTypes.PaymentMethodsModel>;
}

export const PaymentMethodForm = ({
  edit,
  currency = null,
  paymentMethods,
  onCancel,
  onCreated,
  paymentMethodCurrencies,
  paymentMethodCreateOrUpdate = (data) =>
    paymentService.save(data, { method: data.id ? 'PUT' : 'POST' }),
}: PaymentMethodFormProps) => {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<any>(
    edit || {
      currency,
    },
  );
  const [paymentMethod, setPaymentMethod] = useState();
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

  useEffect(() => {
    setPaymentMethod(
      (formValues.selectedPaymentMethods || []).find(
        (p: any) => p.fields.length > 0,
      ),
    );
  }, [formValues.selectedPaymentMethods]);

  useEffect(() => {
    if (!isMounted && defaultCurrency && paymentMethods.length) {
      setIsMounted(true);
      setFormValues({
        ...formValues,
        currency: defaultCurrency,
        paymentMethod:
          paymentMethods.length === 1 ? paymentMethods[0] : undefined,
      });
    }
  }, [isMounted, formValues, paymentMethods, defaultCurrency]);

  const handleOnChange = (
    targetName: string,
    targetValue: any,
    foundErrors: string[] | null,
  ) => {
    const forUpdate = {
      [targetName]: targetValue,
    };
    setFormValues({ ...formValues, ...forUpdate });
    setErrors({
      ...errors,
      [targetName]: foundErrors,
    });
  };

  const save = async () => {
    try {
      setSaving(true);

      const payload = (formValues.selectedPaymentMethods || []).map((p) => ({
        id: formValues.userPaymentMethodId,
        data: JSON.stringify({}),
        currency: formValues.currency,
        paymentMethodId: p.paymentMethodId,
        balance: 0,
      }));

      if (paymentMethod) {
        const data = Object.keys(formValues).reduce(
          (acc: any, formFieldName) => {
            const [, fieldName] = formFieldName.split('.');
            if (fieldName) {
              const [, id] = fieldName.split(':');
              const field = paymentMethod.fields.find(
                (f: any) => f.id === Number(id),
              );
              if (field) {
                return {
                  ...acc,
                  [fieldName]: formValues[formFieldName],
                };
              }
            }
            return acc;
          },
          {},
        );

        payload.push({ ...paymentMethod, data });
      }

      const { data: id } = await paymentMethodCreateOrUpdate(payload);
      onCreated && onCreated(id);
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
                value={formValues.selectedPaymentMethods}
                onChange={(_, v) => {
                  const method = v[v.length - 1];
                  if (method.fields.length === 0) {
                    onChangeWrapper(v);
                  } else {
                    setPaymentMethod(method);
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
            const fieldName = `paymentMethodFields.${field.contentType}:${field.id}`;
            return (
              <FieldProvider
                key={field.id}
                name={fieldName}
                validators={fieldValidators}
                label={field.name || t(field.contentType)}
                onChange={handleOnChange}
                renderInput={(onChangeWrapper) => (
                  <Field
                    value={formValues[fieldName]}
                    onChange={onChangeWrapper}
                    base64
                    fullWidth
                  />
                )}
              />
            );
          })}
          <Alert severity="info">{t('paymentMethodHint')}</Alert>
          <Box display="flex" marginTop={1}>
            <Button onClick={() => setPaymentMethod(undefined)}>Cancel</Button>
            <div className="flex-grow" />
            {renderSaveBtn()}
          </Box>
        </Box>
      )}

      {Boolean(!paymentMethod && formValues.selectedPaymentMethods) && (
        <Box>{renderSaveBtn()}</Box>
      )}
    </Box>
  );
};

PaymentMethodForm.propTypes = {
  // Item for editing
  edit: PropTypes.object,
  onCancel: PropTypes.func,
  onCreated: PropTypes.func,
  currency: PropTypes.string,
};
