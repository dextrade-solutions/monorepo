import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import P2PTradeHistory from '../../components/app/p2p-trade-history';
import Icon from '../../components/ui/icon';
import { HOME_ROUTE } from '../../helpers/constants/routes';

export const SwapHistory = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Box marginBottom={2}>
        <Button
          startIcon={<Icon name="arrow-left-dex" />}
          color="secondary"
          onClick={() => navigate(HOME_ROUTE)}
        >
          Back
        </Button>
      </Box>
      <P2PTradeHistory />
    </Box>
  );
};
