import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { FormTextField, Text } from '../../component-library';
import Box from '../../ui/box/box';
import { SUPPORTED_FIAT_LIST } from '../../../helpers/constants/fiat';
import { dextradeRequest, savePaymentMethod } from '../../../store/actions';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  DISPLAY,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import Button from '../../ui/button';
import Select from '../../ui/select/Select';
import FileField from '../../ui/file-field';
import {
  isRequired,
  luhnCheck,
  maxLen,
  phone,
} from '../../../constants/validators';
import { humanizePaymentMethodName } from '../../../../shared/lib/payment-methods-utils';
import TextArea from '../../ui/textarea/textarea';
import TextField from '../../ui/text-field';

const PAYMENT_METHOD_FORM_FIELDS = {
  TEXT_AREA: TextArea,
  TEXT_FIELD: FormTextField,
  IMAGE: FileField,
};

const CONTENT_TYPE_VALIDATORS = {
  IBAN_OR_CARD_NUMBER: [luhnCheck],
  ADDITIONAL_INFO: [maxLen(100)],
  PHONE: [phone],
};

const FieldProvider = ({
  label,
  name,
  validators = [],
  onChange,
  renderInput,
}) => {
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
      <Text variant={TextVariant.bodyMd} marginBottom={1}>
        {label}
      </Text>
      {renderInput(handleChange)}
      {Boolean(errors.length) && (
        <Text variant={TextVariant.bodySm} color={TextColor.errorDefault}>
          {errors.join(',')}
        </Text>
      )}
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

export default function PaymentMethodForm({
  edit,
  currency = null,
  onCancel,
  onCreated,
}) {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const [formValues, setFormValues] = useState(
    edit || {
      currency,
    },
  );
  const [errors, setErrors] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);

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

  // useEffect(() => {
  //   dispatch(
  //     dextradeRequest({
  //       url: `api/payment/methods/currencies`,
  //     }),
  //   ).then((result) => {
  //     setCurrencies(result);
  //   });
  // }, [dispatch, formValues.country]);

  useEffect(() => {
    const url = 'api/payment/methods';
    // if (formValues.currency) {
    //   url = `api/payment/methods/by/currency/${formValues.currency}`;
    // }
    dispatch(
      dextradeRequest({
        url,
      }),
    ).then((result) => {
      setPaymentMethods(result);
    });
  }, [dispatch]);

  const save = () => {
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
      balance: formValues.balance,
      currency: formValues.currency || 'THB',
      paymentMethodId: formValues.paymentMethod.paymentMethodId,
    };
    try {
      dispatch(savePaymentMethod(payload));
      onCreated && onCreated();
    } catch (e) {
      // ignore
    }
  };

  return (
    <Box>
      <FieldProvider
        name="currency"
        validators={[isRequired]}
        label="Currency"
        renderInput={(onChangeWrapper) => (
          <Select
            value={formValues.currency}
            onChange={onChangeWrapper}
            autocomplete
            options={SUPPORTED_FIAT_LIST}
          />
        )}
        onChange={handleOnChange}
      />
      <FieldProvider
        name="paymentMethod"
        validators={[isRequired]}
        label="Payment method"
        renderInput={(onChangeWrapper) => (
          <Select
            value={formValues.paymentMethod}
            onChange={onChangeWrapper}
            options={paymentMethods}
            itemText="name"
            autocomplete
            renderLabel={(_, { name }) => humanizePaymentMethodName(name, t)}
            itemValue="paymentMethodId"
          />
        )}
        onChange={handleOnChange}
      />
      <FieldProvider
        name="balance"
        label="Balance"
        renderInput={(onChangeWrapper) => (
          <TextField
            type="number"
            value={formValues.balance}
            fullWidth
            onChange={onChangeWrapper}
          />
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
                  />
                )}
              />
            );
          })}
      </Box>
      <Text
        paddingTop={2}
        paddingBottom={2}
        color={TextColor.textAlternative}
        variant={TextVariant.bodySm}
      >
        {t('p2pBankAccountFormHint')}
      </Text>
      <Box display={DISPLAY.FLEX}>
        <div className="flex-grow"></div>
        {onCancel && (
          <Button
            className="bank-account-picker__cancel-btn"
            type="link"
            onClick={onCancel}
          >
            {t('cancel')}
          </Button>
        )}
        <Button
          className="bank-account-picker__save-btn"
          type="link"
          onClick={save}
        >
          {t('save')}
        </Button>
      </Box>
    </Box>
  );
}

PaymentMethodForm.propTypes = {
  // Item for editing
  edit: PropTypes.object,
  onCancel: PropTypes.func,
  onCreated: PropTypes.func,
  currency: PropTypes.string,
};
