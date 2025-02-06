import { Button, Card, CardContent, Box, Typography } from '@mui/material';
import { Icon } from 'dex-ui';
import { LogOut } from 'lucide-react';
import { useUser } from '../hooks/use-user';

export default function Profile() {
  const { logout } = useUser();
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
            }}
          >
            {/* <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: 'action.disabledBackground',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Icon size="xl" name="download" />
            </Box> */}
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
