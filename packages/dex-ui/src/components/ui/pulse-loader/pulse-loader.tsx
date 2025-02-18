import { Box } from '@mui/material';
import './index.scss';

export default function PulseLoader({ bgColor }: { bgColor?: string }) {
  return (
    <div className="pulse-loader">
      <Box
        sx={{ background: (theme) => bgColor || theme.palette.text.primary }}
        className="pulse-loader__loading-dot-one"
      />
      <Box
        sx={{ background: (theme) => bgColor || theme.palette.text.primary }}
        className="pulse-loader__loading-dot-two"
      />
      <Box
        sx={{ background: (theme) => bgColor || theme.palette.text.primary }}
        className="pulse-loader__loading-dot-three"
      />
    </div>
  );
}
