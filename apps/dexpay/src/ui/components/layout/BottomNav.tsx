import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Wallet, Store, Users, History, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [value, setValue] = useState(location);

  useEffect(() => {
    setValue(location);
  }, [location]);

  const items = [
    { icon: <Wallet />, label: 'Wallet', href: '/' },
    { icon: <Store />, label: 'Merchant', href: '/merchant' },
    { icon: <Users />, label: 'P2P', href: '/p2p' },
    { icon: <History />, label: 'History', href: '/history' },
    { icon: <User />, label: 'Profile', href: '/profile' },
  ];
  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          setLocation(newValue);
        }}
        showLabels
      >
        {items.map(({ icon, label, href }) => (
          <BottomNavigationAction
            key={href}
            label={label}
            icon={icon}
            value={href}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
