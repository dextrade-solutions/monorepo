import { Alert } from '@mui/material';
import type { Connection } from 'dex-connect';
import { isMobileWeb } from 'dex-helpers';

import InvoicePreloader from './InvoicePreloader';
import InvoiceView from './InvoiceView';
import useInvoice from './react-queries/queries/useInvoice';

export default function Invoice({
  connections,
  id,
  onBack,
}: {
  id: string;
  connections: Connection[]; // TODO: add type of connections
  onBack?: () => void;
}) {
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
      invoice={invoice.data}
      showQrListItem={!isMobileWeb}
      connections={connections}
      onBack={onBack}
    />
  );
}
