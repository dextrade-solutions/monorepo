// /Users/rkomarov/projects/dextrade/monorepo/apps/dexpay/src/ui/layouts/LayoutDefault.tsx
import { Box, Container } from '@mui/material';
import React from 'react';
import { useHashLocation } from 'wouter/use-hash-location';

import Appbar from '../../app-bar';
import { ROUTE_HOME } from '../../constants/pages';
import { useAuth } from '../../hooks/use-auth';
import BottomNav from '../layout/BottomNav';

export const LayoutDefault: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  const [location] = useHashLocation();

  const tertiaryBg = user?.isCashier && location === ROUTE_HOME;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Ensure full viewport height
        // backgroundColor: 'background.default', // Set background color
        backgroundImage: (theme) =>
          tertiaryBg
            ? `linear-gradient(180deg, ${theme.palette.tertiary.main} 40%, ${theme.palette.background.default} 40%)`
            : theme.palette.background.default,
        width: '100%',
        pb: 6,
        mx: 'auto',
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: (theme) => theme.spacing(0, 2, 4),
          paddingBottom: 10,
          width: '100%',
        }}
      >
        <Appbar />
        {children}
        <BottomNav />
      </Container>
    </Box>
  );
};
