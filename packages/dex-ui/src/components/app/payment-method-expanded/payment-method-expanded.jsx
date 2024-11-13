import { Box, Typography } from '@mui/material';
import { PaymentContentTypes, humanizePaymentMethodName } from 'dex-helpers';
import { CopyData } from 'dex-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Image from '../../ui/image';

export default function PaymentMethodExpanded({ title, paymentMethod: item }) {
  const { t } = useTranslation();
  const fields = JSON.parse(item.data);

  function getOutput(fieldKey, value) {
    const [contentType, id] = fieldKey.split(':');

    const field = item.paymentMethod.fields.find((f) =>
      id ? f.id === Number(id) : f.contentType === contentType,
    );
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
          <Box key={fieldKey} display="flex" alignItems="center">
            <Typography className="flex-grow" textAlign="left">
              {fieldName}
            </Typography>
            <CopyData data={value} className="flex-shrink" />
          </Box>
        );
      case PaymentContentTypes.image:
      case PaymentContentTypes.imageQR:
        return <Image src={value} />;
      default:
        return (
          <Box key={fieldKey}>
            <Typography>{fieldName}</Typography>
            <Typography>{value}</Typography>
          </Box>
        );
    }
  }

  return (
    <Box>
      <Typography marginBottom={2} color="text.secondary">
        {title}
      </Typography>
      <Typography marginBottom={4} variant="h5">
        {humanizePaymentMethodName(item.paymentMethod.name, t)}
      </Typography>
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
