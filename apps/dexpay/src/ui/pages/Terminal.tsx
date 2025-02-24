import { Box } from '@mui/material';
import React, { useState } from 'react';
import NumpadInput from '../components/ui/NumpadInput';

export default function Terminal() {
  const [amount, setAmount] = useState('');
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '90vh', // Make container take up full viewport height
        justifyContent: 'center', // Vertically center content
        alignItems: 'center', // Horizontally center content
      }}
    >
      <NumpadInput value={amount} onChange={setAmount} />
    </Box>
  );
}
