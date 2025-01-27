import { Box, Button, Typography } from '@mui/material';
import { Invoice, Icon } from 'dex-ui';
import { useParams, useNavigate } from 'react-router-dom';

import {
  SOLANA_CONNECT_API,
  SOLANA_CONNECT_WALLETS,
} from '../../app/helpers/solana-config';
import { config } from '../../app/helpers/web3-client-configuration';
import { PLANS_ROUTE } from '../helpers/constants/routes';
import { shortenAddress } from 'dex-helpers';

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Typography>Invoice ID: {shortenAddress(id)}</Typography>
        <Box className="flex-grow" />
        <Button
          startIcon={<Icon name="arrow-left-dex" />}
          color="secondary"
          variant="contained"
          onClick={() => navigate(PLANS_ROUTE)}
        >
          Back
        </Button>
      </Box>
      <Invoice
        wagmiConfig={config}
        id={id}
        solana={{
          SOLANA_CONNECT_WALLETS,
          SOLANA_CONNECT_API,
        }}
      />
    </Box>
  );
}
