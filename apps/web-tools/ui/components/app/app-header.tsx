import { AppBar, Box, Container, Toolbar } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

export default function AppHeader() {
  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      enableColorOnDark
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box display="flex" alignItems="center" width="100%">
            <Link to="/" className="flex-grow">
              <img src="/images/logo/dextrade-full.svg" />
            </Link>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
