import {
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuList,
  Typography,
} from '@mui/material';
import { useGlobalModalContext } from 'dex-ui';
import { Tag, Zap } from 'lucide-react';
import React, { useState } from 'react';

import InvoiceForm from '../components/invoices/form/InvoiceForm';
import OpenInvoice from '../components/invoices/form/OpenInvoiceForm';
import { CurrencyGroupType } from '../constants/coins';
import { useAuth } from '../hooks/use-auth';

const TYPES = {
  fixedInvoice: 1,
  openInvoice: 2,
};

type InvoiceType = (typeof TYPES)[keyof typeof TYPES];

export default function CreateInvoice() {
  const { invoicePreferences } = useAuth();
  const { showModal } = useGlobalModalContext();
  const [type, setType] = useState<InvoiceType>();
  // Select type: Fixed Amount Invoice, Open invoice
  if (type === TYPES.fixedInvoice) {
    return <InvoiceForm />;
  }
  if (type === TYPES.openInvoice) {
    return <OpenInvoice />;
  }

  const handleShortcut = (params: {
    isOpenInvoice?: boolean;
    currencyGroupType: CurrencyGroupType;
  }) => {
    showModal({
      name: 'SHORTCUT_NEW_INVOICE',
      ...params,
    });
  };

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
      <Typography variant="h6" color="text.tertiary" fontWeight="bold">
        Shortcuts
      </Typography>

      {invoicePreferences && (
        <ListItemButton
          sx={{ color: 'text.tertiary' }}
          onClick={() =>
            handleShortcut({ currencyGroupType: CurrencyGroupType.my })
          }
        >
          <ListItemAvatar>
            <Zap size={16} opacity={0.5} />
            <Tag />
          </ListItemAvatar>
          <ListItemText
            primary="My shortcut"
            secondary="Your own prefrencies"
          />
        </ListItemButton>
      )}
      <ListItemButton
        sx={{ color: 'text.tertiary' }}
        onClick={() =>
          handleShortcut({ currencyGroupType: CurrencyGroupType.mostPopular })
        }
      >
        <ListItemAvatar>
          <Zap size={16} opacity={0.5} />
          <Tag />
        </ListItemAvatar>
        <ListItemText
          primary="Most popular crypto"
          secondary="USDT, TRX, BTC, ETH, SOL, BNB"
        />
      </ListItemButton>
      <ListItemButton
        sx={{ color: 'text.tertiary' }}
        onClick={() =>
          handleShortcut({ currencyGroupType: CurrencyGroupType.usdt })
        }
      >
        <ListItemAvatar>
          <Zap size={16} opacity={0.5} />
          <Tag />
        </ListItemAvatar>
        <ListItemText primary="USDT" secondary="On all networks" />
      </ListItemButton>
      {/* <ListItemButton
        sx={{ color: 'text.tertiary' }}
        onClick={() =>
          handleShortcut({
            isOpenInvoice: true,
            currencyGroupType: CurrencyGroupType.mostPopular,
          })
        }
      >
        <ListItemAvatar>
          <Zap size={16} opacity={0.5} />
          <PackageOpen />
        </ListItemAvatar>
        <ListItemText
          primary="Open invoice with most used crypto"
          secondary="Creates with USDT, USDC, BTC, ETH"
        />
      </ListItemButton> */}
    </MenuList>
  );
}
