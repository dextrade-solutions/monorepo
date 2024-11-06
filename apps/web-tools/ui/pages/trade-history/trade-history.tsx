import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import P2PTradeHistory from '../../components/app/p2p-trade-history';
import { HOME_ROUTE } from '../../helpers/constants/routes';

export const SwapHistory = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <P2PTradeHistory onBack={() => navigate(HOME_ROUTE)} />
    </Box>
  );
};
