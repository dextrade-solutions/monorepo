import { Alert } from '@mui/material';
import type { Connection } from 'dex-connect';
import { isMobileWeb } from 'dex-helpers';

import InvoicePreloader from './InvoicePreloader';
import InvoiceView from './InvoiceView';
import useInvoice from './react-queries/queries/useInvoice';
import { IInvoiceFull } from './types/entities';

interface InvoiceProps {
  connections: Connection[];
  id: string;
  preloaderType?: string; // You might want to define a more specific type here if you have a limited set of preloader types
  hideHeader?: boolean;
  preview?: boolean;
  showInvoiceUrlQr?: boolean;
  showQrListItem?: boolean;
  onBack?: () => void;
}

export default function Invoice({
  connections,
  id,
  preloaderType,
  hideHeader,
  preview,
  showInvoiceUrlQr,
  showQrListItem,
  onBack,
}: InvoiceProps) {
  const invoice = useInvoice({ id });
  if (invoice.isLoading) {
    return <InvoicePreloader />;
  }
  if (invoice.isError) {
    return (
      <Alert severity="info">
        Invoice with id <strong>{id}</strong> cannot be loaded
      </Alert>
    );
  }
  return (
    <InvoiceView
      invoice={invoice.data as IInvoiceFull}
      showQrListItem={
        showQrListItem === undefined ? !isMobileWeb : showQrListItem
      }
      connections={connections}
      onBack={onBack}
      preview={preview}
      showInvoiceUrlQr={showInvoiceUrlQr}
      hideHeader={hideHeader}
    />
  );
}
