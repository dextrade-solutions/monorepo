import { Box, Button, Card, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import InputAmount from './input-amount';
import {
  SWAPS_HISTORY_ROUTE,
  SETTINGS_ROUTE,
} from '../../../helpers/constants/routes';
import { useAuthP2P } from '../../../hooks/useAuthP2P';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { ButtonIcon } from '../../ui/button-icon';
import SelectCoins from '../../ui/select-coins';
import P2PExchangers from '../p2p-ads';

export default function P2PSwap() {
  const t = useI18nContext();
  const navigate = useNavigate();
  const auth = useAuthP2P();
  const { isConnected } = useAccount();
  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        paddingX={1}
        marginBottom={2}
      >
        <Typography fontWeight="bold" variant="h4">
          P2P
        </Typography>
        {isConnected && (
          <Box display="flex" alignItems="center">
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => {
                auth(() => navigate(SWAPS_HISTORY_ROUTE));
              }}
            >
              {t('activity')}
            </Button>
            <Box marginLeft={2}>
              <ButtonIcon
                iconName="setting-dex"
                size="xl"
                onClick={() => navigate(SETTINGS_ROUTE)}
              />
            </Box>
          </Box>
        )}
      </Box>
      <Card
        className="overflow-unset"
        variant="outlined"
        sx={{ bgcolor: 'primary.light' }}
      >
        <Box padding={2}>
          <SelectCoins includeFiats />
          <InputAmount />
        </Box>
      </Card>
      <P2PExchangers />
    </Box>
  );
}
