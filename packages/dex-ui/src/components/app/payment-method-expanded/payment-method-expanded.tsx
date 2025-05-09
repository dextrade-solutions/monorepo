import { Box, Typography } from '@mui/material';
import { PaymentContentTypes, humanizePaymentMethodName } from 'dex-helpers';
import { PaymentMethod } from 'dex-helpers/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import CopyData from '../../ui/copy-data';
import Image from '../../ui/image';

export default function PaymentMethodExpanded({
  title,
  name,
  fields = [],
  nocopy,
}: {
  title: string;
  name: string;
  fields: PaymentMethod['fields'];
  nocopy?: boolean;
}) {
  const { t } = useTranslation();
  // const fields = JSON.parse(item.data || '{}');

  function getOutput(field: PaymentMethod['fields'][0]) {
    const { value } = field;
    const fieldName = field.name || t(field.contentType);
    switch (field.contentType) {
      case PaymentContentTypes.image:
      case PaymentContentTypes.imageQR:
        return <Image src={value} />;
      default:
        return (
          <Box key={field.id} display="flex" alignItems="center">
            <Typography
              className="flex-grow nowrap"
              color="text.secondary"
              textAlign="left"
            >
              {fieldName}
            </Typography>
            {nocopy ? (
              <Typography fontWeight="bold">{value}</Typography>
            ) : (
              <CopyData data={value} />
            )}
          </Box>
        );
    }
  }

  // const fieldsList = Object.entries(fields);

  return (
    <Box width="100%">
      {title && (
        <Typography marginBottom={2} color="text.secondary">
          {title}
        </Typography>
      )}
      <Typography>{humanizePaymentMethodName(name, t)}</Typography>
      {fields.length > 0 && (
        <Box sx={{ bgcolor: 'secondary.dark', borderRadius: 0.5, mt: 1, p: 1 }}>
          {fields
            .filter((f) => Boolean(f.value))
            .map((f) => (
              <Box key={f.id}>{getOutput(f)}</Box>
            ))}
        </Box>
      )}
    </Box>
  );
}
