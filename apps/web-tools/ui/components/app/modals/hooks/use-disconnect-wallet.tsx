import { Box, Typography } from '@mui/material';
import { UrlIcon, useGlobalModalContext } from 'dex-ui';

import { useWallets } from '../../../../hooks/asset/useWallets';

export const useDisconnectWallet = () => {
  const { showModal } = useGlobalModalContext();

  const disconnectWallet = (item: ReturnType<typeof useWallets>) => {
    if (!item) {
      console.warn('Trying to disconnect undefined wallet');
      return;
    }

    showModal({
      name: 'CONFIRM_MODAL',
      title: (
        <Box display="flex" alignItems="center">
          <UrlIcon size={40} url={item.icon} />
          <Typography variant="h5" ml={2}>
            Disconnect {item.name}
          </Typography>
        </Box>
      ),
      onConfirm: async () => {
        try {
          await item.disconnect();
        } catch (error) {
          console.error('Error disconnecting wallet:', error);
          // Optionally, show an error message to the user.
          showModal({
            name: 'ALERT_MODAL',
            message:
              'There was an error disconnecting the wallet. Please try again.',
          });
        }
      },
    });
  };

  return disconnectWallet;
};
