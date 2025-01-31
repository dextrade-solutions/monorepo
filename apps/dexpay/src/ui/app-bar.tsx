import { AppBar, Box, Typography } from '@mui/material';
import { useLocation } from 'wouter';

import {
  ROUTE_HISTORY,
  ROUTE_HOME,
  ROUTE_INVOICE_CREATE,
  ROUTE_MERCHANT,
  ROUTE_P2P,
  ROUTE_PROFILE,
} from './constants/pages';
import ProjectSelectBtn from './project-select-button';

const titles = {
  [ROUTE_HOME]: 'Wallet',
  [ROUTE_MERCHANT]: 'Merchant',
  [ROUTE_INVOICE_CREATE]: 'Create invoice',
  [ROUTE_P2P]: 'P2P',
  [ROUTE_HISTORY]: 'Transaction History',
  [ROUTE_PROFILE]: 'Profile',
};

const Appbar = () => {
  const [location] = useLocation();
  const title = titles[location] || ''; // Get title based on route or default to empty string

  return (
    <AppBar position="static" elevation={0} color="transparent">
      <Box
        my={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title} {/* Display dynamic title */}
        </Typography>
        <ProjectSelectBtn />
      </Box>
    </AppBar>
  );
};

export default Appbar;
