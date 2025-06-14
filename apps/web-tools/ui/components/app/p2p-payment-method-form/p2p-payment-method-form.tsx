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
import { humanizePaymentMethodName } from 'dex-helpers';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import P2PService from '../../../../app/services/p2p-service';
import {
  isRequired,
  luhnCheck,
  maxLen,
  phone,
} from '../../../helpers/constants/validators';
import { useI18nContext } from '../../../hooks/useI18nContext';

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

const FieldProvider = ({ label, name, validators, onChange, renderInput }) => {
  const [errors, setErrors] = useState([]);
  const handleChange = (v) => {
    const targetName = name;
    const targetValue = v?.target ? v.target.value : v;

    const foundErrors = validators.reduce((acc, validate) => {
      const error = (validate(targetValue) || '').replace('{v}', 'Field');
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

FieldProvider.propTypes = {
  renderInput: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  validators: PropTypes.arrayOf(PropTypes.func),
  onChange: PropTypes.func.isRequired,
};

export const PaymentMethodForm = ({
  edit,
  currency = null,
  onCancel,
  onCreated,
}) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const [formValues, setFormValues] = useState(
    edit || {
      currency,
    },
  );
  const [errors, setErrors] = useState({});
  // const [paymentMethods, setPaymentMethods] = useState([]);

  const { isLoading: currenciesLoading, data: currencies = [] } = useQuery({
    queryKey: ['paymentMethodsCurrencies'],
    queryFn: () =>
      P2PService.paymentMethodCurrenciesIndex().then(
        (response) => response.data,
      ),
  });

  const { isLoading: paymentMethodsLoading, data: paymentMethods = [] } =
    useQuery({
      queryKey: ['paymentMethods'],
      queryFn: () =>
        P2PService.paymentMethodIndex().then((response) => response.data),
    });

  const handleOnChange = (targetName, targetValue, foundErrors) => {
    const forUpdate = {
      [targetName]: targetValue,
    };
    // if (targetName === 'currency') {
    //   forUpdate.paymentMethod = null;
    // }
    setFormValues({ ...formValues, ...forUpdate });
    setErrors({
      ...errors,
      [targetName]: foundErrors,
    });
  };

  const save = async () => {
    const data = Object.keys(formValues).reduce((acc, formFieldName) => {
      const [, fieldName] = formFieldName.split('.');
      if (fieldName) {
        const [, id] = fieldName.split(':');
        const field = formValues.paymentMethod.fields.find(
          (f) => f.id === Number(id),
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
    await P2PService.paymentMethodCreateOrUpdate(payload);
    onCreated && onCreated();
  };

  return (
    <Box>
      <FieldProvider
        name="currency"
        validators={[isRequired]}
        label="Currency"
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
        label="Payment method"
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
          // <Select
          //   value={formValues.paymentMethod}
          //   onChange={onChangeWrapper}
          //   options={paymentMethods}
          //   itemText="name"
          //   fullWidth
          //   autocomplete
          //   placeholder="123"
          //   renderLabel={(_, { name }) => humanizePaymentMethodName(name, t)}
          //   itemValue="paymentMethodId"
          // />
        )}
        onChange={handleOnChange}
      />
      <Box>
        {formValues.paymentMethod &&
          formValues.paymentMethod.fields.map((field) => {
            const Field = PAYMENT_METHOD_FORM_FIELDS[field.fieldType];
            const fieldValidators = [];
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
      <Alert severity="info">
        Hint: during the trade, the details of the added payment method will be
        shown to the buyer to make the proper payment, while sellers will see
        the buyer's real name. Make sure the information is correct, genuine and
        matches your KYC information on Dextrade
      </Alert>
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
