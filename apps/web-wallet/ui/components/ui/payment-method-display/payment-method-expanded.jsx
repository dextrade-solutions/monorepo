import React from 'react';
import PropTypes from 'prop-types';
import Box from '../box';
import { Text } from '../../component-library';
import {
  DISPLAY,
  TEXT_ALIGN,
  TextVariant,
} from '../../../helpers/constants/design-system';
import CopyData from '../copy-data';
import { PaymentContentTypes } from '../../../helpers/constants/payment-methods';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { humanizePaymentMethodName } from '../../../../shared/lib/payment-methods-utils';
import Image from '../image';

export default function PaymentMethodExpanded({ title, paymentMethod: item }) {
  const t = useI18nContext();
  const fields = JSON.parse(item.data);

  function getOutput(fieldKey, value) {
    const [, id] = fieldKey.split(':');

    const field = item.paymentMethod.fields.find((f) => f.id === Number(id));
    const fieldName = field.name || t(field.contentType);
    switch (field.contentType) {
      case PaymentContentTypes.accountOpeningDepartment:
      case PaymentContentTypes.bankName:
      case PaymentContentTypes.cardNumber:
      case PaymentContentTypes.email:
      case PaymentContentTypes.iban:
      case PaymentContentTypes.ibanOrCardNumber:
      case PaymentContentTypes.last4digits:
      case PaymentContentTypes.username:
      case PaymentContentTypes.phone:
      case PaymentContentTypes.fullName:
      case PaymentContentTypes.ban:
        return (
          <Box key={fieldKey} display={DISPLAY.FLEX}>
            <Text className="flex-grow" textAlign={TEXT_ALIGN.LEFT}>
              {fieldName}
            </Text>
            <CopyData data={value} className="flex-shrink" />
          </Box>
        );
      case PaymentContentTypes.image:
      case PaymentContentTypes.imageQR:
        return <Image src={value} />;
      default:
        return (
          <Box key={fieldKey}>
            <Text>{fieldName}</Text>
            <Text>{value}</Text>
          </Box>
        );
    }
  }

  return (
    <Box>
      <Text marginBottom={2} variant={TextVariant.bodyLgMedium}>
        {title}
      </Text>
      <Text marginBottom={4} variant={TextVariant.headingMd}>
        {humanizePaymentMethodName(item.paymentMethod.name, t)}
      </Text>
      {Object.entries(fields)
        .filter(([_, value]) => Boolean(value))
        .map(([field, value]) => (
          <Box key={field} marginBottom={2} marginTop={2}>
            {getOutput(field, value)}
          </Box>
        ))}
    </Box>
  );
}

PaymentMethodExpanded.propTypes = {
  title: PropTypes.string,
  paymentMethod: PropTypes.object,
};
