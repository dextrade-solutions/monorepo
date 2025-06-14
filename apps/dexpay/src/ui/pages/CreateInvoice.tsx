import {
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuList,
  Typography,
} from '@mui/material';
import { Tag } from 'lucide-react';
import React, { useState } from 'react';

import InvoiceForm from '../components/invoices/form/InvoiceForm';
import OpenInvoice from '../components/invoices/form/OpenInvoiceForm';

const TYPES = {
  fixedInvoice: 1,
  openInvoice: 2,
};

type InvoiceType = (typeof TYPES)[keyof typeof TYPES];

export default function CreateInvoice() {
  const [type, setType] = useState<InvoiceType>();

  return <InvoiceForm />;

  // Select type: Fixed Amount Invoice, Open invoice
  if (type === TYPES.fixedInvoice) {
    return <InvoiceForm />;
  }
  if (type === TYPES.openInvoice) {
    return <OpenInvoice />;
  }

  return (
    <MenuList>
      <Typography variant="h6" color="text.tertiary" fontWeight="bold">
        Invoice type
      </Typography>
      <ListItemButton
        sx={{ color: 'text.tertiary' }}
        onClick={() => setType(TYPES.fixedInvoice)}
      >
        <ListItemAvatar>
          <Tag />
        </ListItemAvatar>
        <ListItemText
          primary="Invoice"
          secondary="Is a payment request with a set, non-editable amount for standard billing and fixed-price services."
        />
      </ListItemButton>
      {/* <ListItemButton
        sx={{ color: 'text.tertiary' }}
        onClick={() => setType(TYPES.openInvoice)}
      >
        <ListItemAvatar>
          <PackageOpen />
        </ListItemAvatar>
        <ListItemText
          primary="Open invoice"
          secondary="Allows users to enter and pay any amount multiple times using a reusable payment link, ideal for flexible payments and donations."
        />
      </ListItemButton> */}
    </MenuList>
  );
}
