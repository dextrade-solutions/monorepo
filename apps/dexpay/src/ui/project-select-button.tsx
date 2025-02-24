import { Avatar, Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { bgPrimaryGradient, useGlobalModalContext } from 'dex-ui';
import { ChevronDown } from 'lucide-react';
import React from 'react';

import { useAuth } from './hooks/use-auth';

// const StyledButton = styled(Button)(({ theme }) => ({
//   color: theme.palette.text.tertiary,
//   textTransform: 'none',
//   padding: theme.spacing(0.2, 1),
//   transition: 'all 0.3s ease',
//   backgroundColor: 'transparent',
//   '&:hover': {
//     transform: 'scale(1.04)',
//   },
//   '&:active': {
//     animation: '$bounce 0.3s',
//   },
//   '@keyframes bounce': {
//     '0%, 100%': {
//       transform: 'scale(1)',
//     },
//     '50%': {
//       transform: 'scale(0.95)',
//     },
//   },
// }));

const ProjectSelectButton = () => {
  const { showModal } = useGlobalModalContext();
  const { user, projects } = useAuth();

  const handleClick = () => {
    showModal({
      name: 'SELECT_PROJECT',
      projects,
    });
  };
  const projectName = user?.project.name!;

  return (
    <Button onClick={handleClick} disabled={!user.isRegistrationCompleted}>
      <Avatar
        sx={{
          fontSize: 16,
          fontWeight: 500,
          mr: 1,
          width: 35,
          height: 35,
          backgroundImage: bgPrimaryGradient,
        }}
      >
        {projectName[0].toUpperCase()}
      </Avatar>
      <Box
        textAlign="left"
        sx={{ color: 'tertiary.main', lineHeight: 'normal' }}
      >
        <Box display="flex" alignItems="center">
          <Typography mr={1}>{projectName} </Typography>
          <ChevronDown size={20} />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Welcome back
        </Typography>
      </Box>
    </Button>
  );
};

export default ProjectSelectButton;
