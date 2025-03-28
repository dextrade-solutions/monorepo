import { Box, Typography } from '@mui/material';
import { Button } from 'dex-ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { useMutation } from '../../hooks/use-query';
import { Projects } from '../../services';
import { IProject } from '../../types';

interface ProjectDeleteProps {
  project: IProject | null;
  onDeleted: () => void;
  onClose: () => void;
}

const ProjectDelete: React.FC<ProjectDeleteProps> = ({
  project,
  onDeleted,
  onClose,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const deleteProject = useMutation(Projects.delete, {
    onSuccess: () => {
      onDeleted();
      enqueueSnackbar('Project Deleted', { variant: 'success' });
    },
    onError: (error) => {
      throw error;
    },
  });

  const handleDelete = () => {
    if (project) {
      deleteProject.mutateAsync([{ id: project.id }]);
    }
  };

  return (
    <Box width="100%" textAlign="center">
      <Typography variant="h5" gutterBottom>
        Are you sure?
      </Typography>
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button color="success" onClick={handleDelete}>
          Yes
        </Button>
        <Button color="error" onClick={onClose}>
          No
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectDelete;
