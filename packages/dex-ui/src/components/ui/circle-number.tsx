import { Box, Typography } from '@mui/material';

interface CircleNumberProps {
  number: number;
  size?: number; // Diameter of the circle
  color?: string; // Background color of the circle
  textColor?: string; // Text color
}

const CircleNumber: React.FC<CircleNumberProps> = ({
  number,
  size = 40,
  color = 'primary.main',
  textColor = 'common.white',
}) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="body1"
        sx={{ color: textColor, fontWeight: 'bold' }}
      >
        {number}
      </Typography>
    </Box>
  );
};

export default CircleNumber;
