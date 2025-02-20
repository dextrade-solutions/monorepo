import {
  Button,
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
} from '@mui/material';
import { DownloadCloud, LogOut } from 'lucide-react';
import React from 'react';

import { useAuth } from '../hooks/use-auth';

export default function Profile() {
  const { logout, me } = useAuth();
  return (
    <Box sx={{ maxWidth: 'md', mx: 'auto' }}>
      <Card
        elevation={0}
        sx={{
          my: 2,
          bgcolor: 'secondary.dark',
          borderRadius: 1,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <TextField
            label="Email"
            margin="normal"
            disabled
            fullWidth
            value={me?.email}
          />
          <TextField
            label="First name"
            margin="normal"
            disabled
            fullWidth
            value={me?.first_name}
          />
          <TextField
            label="Last name"
            margin="normal"
            disabled
            fullWidth
            value={me?.last_name}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                borderRadius: '50%',
                bgcolor: 'action.disabledBackground',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                my: 2,
              }}
            >
              <DownloadCloud size={40} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Drag and drop a file here to update
            </Typography>
          </Box>
          <Button fullWidth variant="contained">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Button
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
