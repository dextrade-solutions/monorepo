import {
  Box,
  Typography,
  MenuList,
  ListItemText,
  Divider,
  ListItemButton,
  Button,
} from '@mui/material';
import { ButtonIcon, ModalProps } from 'dex-ui';
import { PlusIcon } from 'lucide-react';
import React from 'react';

import { useAuth } from '../hooks/use-auth';
import { IProject } from '../types';

const SelectProject = ({ hideModal }: ModalProps) => {
  const { user, setProject, projects } = useAuth();

  const handleSelectProject = (project: IProject) => {
    setProject(project);
    hideModal();
  };

  const renderList = projects.filter((p) => p.id !== user?.project.id);

  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Typography>Select project</Typography>
        <ButtonIcon
          iconName="close"
          color="secondary"
          size="sm"
          onClick={hideModal}
        />
      </Box>

      <Box marginY={1}>
        <Divider />
      </Box>
      <Box>
        <MenuList>
          {renderList.map((project) => (
            <ListItemButton
              key={project.id}
              onClick={() => handleSelectProject(project)}
            >
              <ListItemText>{project.name}</ListItemText>
            </ListItemButton>
          ))}
        </MenuList>
        <Button variant="contained" fullWidth endIcon={<PlusIcon />}>
          New project
        </Button>
      </Box>
    </Box>
  );
};

export default SelectProject;
