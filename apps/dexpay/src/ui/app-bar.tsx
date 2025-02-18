import { AppBar, Box, Typography } from '@mui/material';
import { useLocation } from 'wouter';

import {
  ROUTE_HISTORY,
  ROUTE_HOME,
  ROUTE_INVOICE_CREATE,
  ROUTE_MERCHANT,
  ROUTE_P2P,
  ROUTE_P2P_CREATE,
  ROUTE_PROFILE,
  ROUTE_WALLET_DEPOSIT,
  ROUTE_WALLET_WITHDRAW,
} from './constants/pages';
import { useAuth } from './hooks/use-auth';
import ProjectSelectBtn from './project-select-button';

const titles = {
  [ROUTE_HOME]: 'Wallet',
  [ROUTE_WALLET_DEPOSIT]: 'Deposit',
  [ROUTE_WALLET_WITHDRAW]: 'Withdraw',
  [ROUTE_MERCHANT]: 'Merchant',
  [ROUTE_INVOICE_CREATE]: 'Create invoice',
  [ROUTE_P2P]: 'P2P',
  [ROUTE_P2P_CREATE]: 'Add pair',
  [ROUTE_HISTORY]: 'Transaction History',
  [ROUTE_PROFILE]: 'Profile',
};

const Appbar = () => {
  const [location] = useLocation();
  const title = titles[location] || ''; // Get title based on route or default to empty string
  return (
    <AppBar position="static" elevation={0} color="transparent">
      <Box
        mt={1}
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <ProjectSelectBtn />
        <Typography
          color="text.tertiary"
          fontWeight="bold"
          variant="h6"
          component="div"
          sx={{ flexShrink: 1 }}
        >
          {title} {/* Display dynamic title */}
        </Typography>
      </Box>
    </AppBar>
  );
};

export default Appbar;
