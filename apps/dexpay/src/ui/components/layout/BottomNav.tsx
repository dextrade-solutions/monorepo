import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Fab,
  Box,
} from '@mui/material';
import { bgPrimaryGradient } from 'dex-ui';
import {
  Wallet,
  Store,
  Users,
  History,
  User,
  Terminal,
  Smartphone,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

import { ROUTE_HOME } from '../../constants/pages';
import { useAuth } from '../../hooks/use-auth';

const MERCHANT = {
  icon: <Store strokeWidth={1.5} />,
  label: 'Merchant',
  href: '/merchant',
  testId: 'bottom-nav-merchant',
};

const P2P = {
  icon: <Users strokeWidth={1.5} />,
  label: 'P2P',
  href: '/p2p',
  testId: 'bottom-nav-p2p',
};

const HISTORY = {
  icon: <History strokeWidth={1.5} />,
  label: 'History',
  href: '/history',
  testId: 'bottom-nav-history',
};
const HOME = {
  icon: null,
  label: '',
  href: '/',
  testId: 'bottom-nav-home',
};
const USER = {
  icon: <User strokeWidth={1.5} />,
  label: 'Profile',
  href: '/profile',
  testId: 'bottom-nav-profile',
};

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [value, setValue] = useState(location);
  const { user, isCashier } = useAuth();

  useEffect(() => {
    setValue(location);
  }, [location]);

  let items = [MERCHANT, P2P, HOME, HISTORY, USER];

  if (isCashier) {
    items = [HISTORY, HOME, USER];
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.1)',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        sx={{
          display: 'flex',
          justifyContent: 'center', // Center the BottomNavigation
        }}
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          setLocation(newValue);
        }}
      >
        {items.map(({ icon, label, href, testId }) => (
          <BottomNavigationAction
            sx={{
              color: 'text.caption',
              '&.Mui-selected': {
                color: 'tertiary.main',
              },
            }}
            key={href}
            disabled={!user?.isRegistrationCompleted}
            label={label}
            icon={icon}
            value={href}
            data-testid={testId}
          />
        ))}
      </BottomNavigation>
      <Box
        size="large"
        sx={{
          position: 'absolute',
          zIndex: -1,
          bottom: 8,
          left: '50%',
          width: 72,
          boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          height: 72,
          bgcolor: 'background.default',
          transform: 'translateX(-50%)',

          '&:before': {
            content: '""',
            position: 'absolute',
            top: -4,
            left: -20,
            width: 28,
            height: 28,
            bgcolor: 'transparent',
            borderRadius: '50%',
            boxShadow: '15px 18px #fff',
          },
          '&:after': {
            content: '""',
            position: 'absolute',
            top: -4,
            right: -20,
            width: 28,
            height: 28,
            bgcolor: 'transparent',
            borderRadius: '50%',
            boxShadow: '-15px 18px #fff',
          },
        }}
      />
      <Fab
        aria-label="add"
        sx={{
          bgcolor: 'tertiary.main', // Use tertiary.main for background
          color: 'tertiary.contrastText',
          '&:hover': {
            bgcolor: 'tertiary.main',
          },
          backgroundImage:
            (location === ROUTE_HOME && bgPrimaryGradient) || undefined,
          position: 'absolute',
          bottom: 16,
          left: '50%',
          boxShadow: '0px 4px 12px 0px rgba(60, 118, 255, 0.5)',
          transform: 'translateX(-50%)',
        }} // Position the FAB
        onClick={() => setLocation('/')}
        data-testid="bottom-nav-fab"
      >
        {isCashier ? <Smartphone /> : <Wallet strokeWidth={1.5} />}
      </Fab>
    </Paper>
  );
}
