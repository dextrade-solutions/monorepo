import {
  AppBar,
  Autocomplete,
  Box,
  Container,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

export default function AppHeader() {
  const updateLang = () => {};
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      enableColorOnDark
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box display="flex" alignItems="center" width="100%">
            <Link to="/" className="flex-grow">
              <img src="/images/logo/dextrade-full.svg" />
            </Link>
          </Box>
          <Box>
            <Autocomplete
              defaultValue="EN"
              fullWidth
              disableClearable
              options={['RU', 'EN']}
              disablePortal
              renderInput={(params) => (
                <TextField
                  sx={{
                    '& fieldset': { border: 'none' },
                    '.MuiInputBase-input': {
                      fontWeight: 'bold',
                    },
                  }}
                  {...params}
                />
              )}
              onChange={updateLang}
            />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
