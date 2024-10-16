import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function NoMatchPage() {
  const navigate = useNavigate();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="90vh"
    >
      <Typography variant="h1" fontWeight="bold">
        404
      </Typography>
      <Typography marginBottom={4}>Page not found</Typography>
      <Button variant="outlined" onClick={() => navigate('/')}>
        Back to home
      </Button>
    </Box>
  );
}
