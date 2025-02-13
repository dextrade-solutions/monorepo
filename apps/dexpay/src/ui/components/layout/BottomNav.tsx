import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Wallet, Store, Users, History, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';

import { useAuth } from '../../hooks/use-auth';

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [value, setValue] = useState(location);
  const { user } = useAuth();

  useEffect(() => {
    setValue(location);
  }, [location]);

  const items = [
    {
      icon: <Wallet />,
      label: 'Wallet',
      href: '/',
      testId: 'bottom-nav-wallet',
    },
    {
      icon: <Store />,
      label: 'Merchant',
      href: '/merchant',
      testId: 'bottom-nav-merchant',
    },
    { icon: <Users />, label: 'P2P', href: '/p2p', testId: 'bottom-nav-p2p' },
    {
      icon: <History />,
      label: 'History',
      href: '/history',
      testId: 'bottom-nav-history',
    },
    {
      icon: <User />,
      label: 'Profile',
      href: '/profile',
      testId: 'bottom-nav-profile',
    },
  ];

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          setLocation(newValue);
        }}
      >
        {items.map(({ icon, label, href, testId }) => (
          <BottomNavigationAction
            key={href}
            disabled={!user?.isRegistrationCompleted}
            label={label}
            icon={icon}
            value={href}
            data-testid={testId} // Add data-testid
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
