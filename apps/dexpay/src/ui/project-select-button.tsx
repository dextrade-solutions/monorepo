import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import { useGlobalModalContext } from 'dex-ui';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

import { useUser } from './hooks/use-user';

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
  padding: theme.spacing(0.2, 1),
  transition: 'all 0.3s ease',
  backgroundColor: 'transparent',
  '&:hover': {
    transform: 'scale(1.04)',
    // backgroundColor: theme.palette.secondary.main,
  },
  '&:active': {
    animation: '$bounce 0.3s',
    // backgroundColor: theme.palette.error.main,
  },
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(0.95)',
    },
  },
}));

const ProjectSelectButton = () => {
  const { showModal } = useGlobalModalContext();
  const { user } = useUser();

  const handleClick = () => {
    showModal({
      name: 'SELECT_PROJECT',
    });
  };

  return (
    <StyledButton
      variant="contained"
      endIcon={<ChevronDown size={20} />}
      onClick={handleClick}
    >
      {user?.project.name}
    </StyledButton>
  );
};

export default ProjectSelectButton;
