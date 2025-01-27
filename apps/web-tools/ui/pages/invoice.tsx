import { Invoice } from 'dex-ui';

import {
  SOLANA_CONNECT_API,
  SOLANA_CONNECT_WALLETS,
} from '../../app/helpers/solana-config';
import { config } from '../../app/helpers/web3-client-configuration';

export default function InvoicePage() {
  return (
    <Invoice
      wagmiConfig={config}
      solana={{
        SOLANA_CONNECT_WALLETS,
        SOLANA_CONNECT_API,
      }}
    />
  );
}
