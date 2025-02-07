import {
  Box,
  Typography,
  MenuList,
  ListItemText,
  Divider,
  ListItemButton,
  ListItemAvatar,
  ListItemSecondaryAction,
  Button,
  Skeleton,
} from '@mui/material';
import { ButtonIcon, ModalProps } from 'dex-ui';
import { PlusIcon } from 'lucide-react';
import React from 'react';

import { useUser } from '../hooks/use-user';
import { IProject } from '../types';

const SelectProject = ({ hideModal }: ModalProps) => {
  const { setProject, projects: renderList } = useUser();

  const handleSelectProject = (project: IProject) => {
    setProject(project);
    hideModal();
  };

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
