import { Button, Card, CardContent, Box, Typography } from '@mui/material';
import { LogOut, Key, Lock, ChevronRight } from 'lucide-react';
import React from 'react';
import { Link } from 'wouter';

import { useAuth } from '../hooks/use-auth';

export default function Profile() {
  const { logout, me } = useAuth();

  return (
    <Box sx={{ maxWidth: 'md' }}>
      <Card
        elevation={0}
        sx={{
          my: 2,
          bgcolor: 'secondary.dark',
          borderRadius: 1,
        }}
      >
        <CardContent>
          <Typography color="text.secondary" variant="h5" mb={2}>
            Profile
          </Typography>
          <Typography fontWeight="bold">Email</Typography>
          <Typography>{me?.email}</Typography>
        </CardContent>
      </Card>

      {/* options */}
      <Button
        sx={{
          bgcolor: 'secondary.dark',
          color: 'black',
          p: '12px 16px',
          mb: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}
        color="error"
        to="/api-keys"
        component={Link}
        fullWidth
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key />
          Api keys
        </div>
        <ChevronRight />
      </Button>

      {/* options */}
      <Button
        sx={{
          bgcolor: 'secondary.dark',
          color: 'black',
          p: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
        color="error"
        to="/change-password"
        component={Link}
        fullWidth
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock />
          Change Password
        </div>
        <ChevronRight />
      </Button>

      <Button
        data-testid="logout"
        endIcon={<LogOut />}
        sx={{ mt: 3 }}
        fullWidth
        color="error"
        variant="outlined"
        onClick={() => logout()}
      >
        Logout
      </Button>
    </Box>
  );
}
