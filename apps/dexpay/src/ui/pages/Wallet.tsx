import { Button, Paper, Typography, Box } from '@mui/material';
import AssetList from '../components/crypto/AssetList';

export default function Wallet() {
  return (
    <Box>
      <Box mb={8}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="body2" color="textSecondary">
            Balance
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            $1000.00 USD
          </Typography>
        </Paper>
        <Box display="flex" gap={2}>
          <Button fullWidth variant="contained">
            Deposit
          </Button>
          <Button fullWidth variant="outlined">
            Withdraw
          </Button>
        </Box>
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>
          Assets
        </Typography>
        <AssetList />
      </Box>
    </Box>
  );
}
