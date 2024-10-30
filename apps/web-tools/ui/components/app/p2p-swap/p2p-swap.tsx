import { Box, Button, Card, Typography } from '@mui/material';
import { ButtonIcon } from 'dex-ui';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import InputAmount from './input-amount';
import {
  SWAPS_HISTORY_ROUTE,
  SETTINGS_ROUTE,
} from '../../../helpers/constants/routes';
import { useAuthP2P } from '../../../hooks/useAuthP2P';
import { useI18nContext } from '../../../hooks/useI18nContext';
import SelectCoins from '../../ui/select-coins';
import P2PExchangers from '../p2p-ads';
import WalletConnectButton from '../wallet-connect-button';

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
        <div className="flex-grow" />
        <WalletConnectButton />
        {isConnected && (
          <Box display="flex" marginLeft={1} alignItems="center">
            <Button
              color="secondary"
              variant="contained"
              onClick={() => {
                auth(() => navigate(SWAPS_HISTORY_ROUTE));
              }}
            >
              {t('activity')}
            </Button>
            <Box marginLeft={1}>
              <ButtonIcon
                iconName="setting-dex"
                size="lg"
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
