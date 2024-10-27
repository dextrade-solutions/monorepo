import { Box } from '@mui/material';
import './index.scss';

export default function PulseLoader() {
  return (
    <div className="pulse-loader">
      <Box
        sx={{ background: (theme) => theme.palette.text.primary }}
        className="pulse-loader__loading-dot-one"
      />
      <Box
        sx={{ background: (theme) => theme.palette.text.primary }}
        className="pulse-loader__loading-dot-two"
      />
      <Box
        sx={{ background: (theme) => theme.palette.text.primary }}
        className="pulse-loader__loading-dot-three"
      />
    </div>
  );
}
