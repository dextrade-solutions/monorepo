import '../styles.scss';
import { Modal, Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

import { AuthStatus } from '../../../../../app/constants/auth';
import { getAuthStatus } from '../../../../ducks/auth';
import { PulseLoader } from 'dex-ui';

export const SigningModal = () => {
  const authStatus = useSelector(getAuthStatus);
  const showSigningModal = authStatus === AuthStatus.signing;
  return (
    <Modal open={showSigningModal}>
      <Box
        sx={{ bgcolor: 'background.default' }}
        className="modal-generic"
        display="flex"
        flexDirection="column"
        alignItems="center"
        padding={5}
      >
        <Typography marginBottom={4}>
          Please, approve personal sign in you wallet
        </Typography>
        <PulseLoader />
      </Box>
    </Modal>
  );
};
