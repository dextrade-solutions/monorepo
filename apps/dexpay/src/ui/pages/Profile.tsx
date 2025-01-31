import { Button, Card, CardContent, Box, Typography } from "@mui/material";
import { Icon } from "dex-ui";

export default function Profile() {
  return (
    <Box sx={{ maxWidth: 'md', mx: 'auto' }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4
            }}
          >
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: 'action.disabledBackground',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <Icon size="xl" name="download" />
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
    </Box>
  );
}