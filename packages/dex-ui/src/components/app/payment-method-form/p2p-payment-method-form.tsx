import {
  Alert,
  Autocomplete,
  Box,
  Button,
  TextField,
  TextareaAutosize,
  Typography,
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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
      <Typography marginBottom={1}>{label}</Typography>
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
  paymentMethodCreateOrUpdate?: (
    data: any,
  ) => Promise<DextradeTypes.PaymentMethodsModel>;
}

export const PaymentMethodForm = ({
  edit,
  currency = null,
  onCancel,
  onCreated,
  paymentMethodCurrencies,
  paymentMethodList,
  paymentMethodCreateOrUpdate = (data) =>
    paymentService.save(data, { method: data.id ? 'PUT' : 'POST' }),
}: PaymentMethodFormProps) => {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<any>(
    edit || {
      currency,
    },
  );
  const [errors, setErrors] = useState<Record<string, string[] | null>>({});

  const { isLoading: currenciesLoading, data: currencies = [] } = useQuery({
    queryKey: ['paymentMethodsCurrencies'],
    queryFn: (params) => {
      if (paymentMethodCurrencies) {
        return paymentMethodCurrencies(params);
      }
      return paymentService.listAllCurrency().then((r) => r.data);
    },
  });

  const { isLoading: paymentMethodsLoading, data: paymentMethods = [] } =
    useQuery({
      queryKey: ['paymentMethods', formValues.currency],
      queryFn: (params) => {
        if (paymentMethodList) {
          return paymentMethodList();
        }

        const [, currencyParam] = params.queryKey;
        if (currencyParam) {
          return paymentService
            .listAllBankByCurrencyId(currencyParam)
            .then((r) => r.data);
        }
        return paymentService.listAllBanks().then((r) => r.data);
      },
    });

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
    const data = Object.keys(formValues).reduce((acc: any, formFieldName) => {
      const [, fieldName] = formFieldName.split('.');
      if (fieldName) {
        const [, id] = fieldName.split(':');
        const field = formValues.paymentMethod.fields.find(
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
    }, {});

    const payload = {
      id: formValues.userPaymentMethodId,
      data: JSON.stringify(data),
      currency: formValues.currency || 'THB',
      paymentMethodId: formValues.paymentMethod.paymentMethodId,
      balance: 0,
    };
    await paymentMethodCreateOrUpdate(payload);
    onCreated && onCreated();
  };

  return (
    <Box>
      <FieldProvider
        name="currency"
        validators={[isRequired]}
        label={t('currency')}
        renderInput={(onChangeWrapper) => (
          <Autocomplete
            value={formValues.currency}
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
      <FieldProvider
        name="paymentMethod"
        validators={[isRequired]}
        label={t('paymentMethod')}
        renderInput={(onChangeWrapper) => (
          <Autocomplete
            value={formValues.paymentMethod}
            onChange={(_, v) => onChangeWrapper(v)}
            options={paymentMethods}
            fullWidth
            disabled={paymentMethodsLoading}
            getOptionLabel={(option) =>
              humanizePaymentMethodName(option.name, t)
            }
            renderInput={(props) => <TextField {...props} />}
          />
        )}
        onChange={handleOnChange}
      />
      <Box>
        {formValues.paymentMethod &&
          formValues.paymentMethod.fields.map((field: any) => {
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
      </Box>
      <Alert severity="info">{t('paymentMethodHint')}</Alert>
      {formValues.paymentMethod && (
        <Box display="flex" marginTop={1}>
          {onCancel && (
            <Button
              className="bank-account-picker__cancel-btn"
              color="secondary"
              onClick={onCancel}
            >
              {t('cancel')}
            </Button>
          )}
          <div className="flex-grow"></div>
          <Button
            variant="contained"
            className="bank-account-picker__save-btn"
            onClick={save}
          >
            {t('save')}
          </Button>
        </Box>
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
