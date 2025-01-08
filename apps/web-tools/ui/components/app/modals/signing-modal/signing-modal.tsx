import { Modal, Box, Typography } from '@mui/material';
import { PulseLoader } from 'dex-ui';
import { useSelector } from 'react-redux';

import { AuthStatus } from '../../../../../app/constants/auth';
import { getAuthStatus } from '../../../../ducks/auth';

export const SigningModal = () => {
  const authStatus = useSelector(getAuthStatus);
  const showSigningModal = authStatus === AuthStatus.signing;
  return (
    <Modal open={showSigningModal}>
      <Box
        sx={{ bgcolor: 'background.default' }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        padding={5}
      >
        <Typography marginBottom={4}>
          Please, approve personal sign in your wallet
        </Typography>
        <PulseLoader />
      </Box>
    </Modal>
  );
};
