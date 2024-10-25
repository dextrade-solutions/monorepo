import { Box, Button } from '@mui/material';
import { Icon } from 'dex-ui';
import { useNavigate } from 'react-router-dom';

import P2PTradeHistory from '../../components/app/p2p-trade-history';
import { HOME_ROUTE } from '../../helpers/constants/routes';
import { useI18nContext } from '../../hooks/useI18nContext';

export const SwapHistory = () => {
  const t = useI18nContext();
  const navigate = useNavigate();
  return (
    <Box>
      <Box marginBottom={2}>
        <Button
          startIcon={<Icon name="arrow-left-dex" />}
          color="secondary"
          variant="contained"
          onClick={() => navigate(HOME_ROUTE)}
        >
          {t('back')}
        </Button>
      </Box>
      <P2PTradeHistory />
    </Box>
  );
};
