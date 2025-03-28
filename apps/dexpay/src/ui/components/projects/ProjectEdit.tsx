import { Box, FormControlLabel, Checkbox } from '@mui/material';
import { Button, useForm } from 'dex-ui';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';

import { useMutation } from '../../hooks/use-query';
import { DexTrade, Projects } from '../../services';
import { IProject } from '../../types';
import { Validation } from '../../validation';
import { TextFieldWithValidation } from '../fields';

interface ProjectEditProps {
  project: IProject | null;
  onUpdated: (project: IProject) => void;
  onClose: () => void;
}

const ProjectEdit: React.FC<ProjectEditProps> = ({ project, onUpdated }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [existingUser, setExistingUser] = useState('');

  const updateUser = useMutation(DexTrade.userUpdate, {
    onSuccess: () => {
      enqueueSnackbar('You updated DexTrade username', { variant: 'success' });
    },
    onError: (error) => {
      throw error;
    },
  });

  const updateProject = useMutation(Projects.update, {
    onSuccess: (response, values) => {
      onUpdated({
        ...response.data,
        drain_rule: {
          is_enabled: values[1].drain_is_enabled ?? false,
        },
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  const form = useForm({
    values: {
      name: project?.name || '',
      username: existingUser,
      drain_is_enabled: project?.drain_rule.is_enabled,
    },
    validationSchema: Validation.Project.update,
    method: async (values) => {
      if (!project) {
        return;
      }

      await Projects.setDrain(
        { id: project.id },
        { is_enabled: values.drain_is_enabled ?? false },
      );

      await updateProject.mutateAsync([{ id: project.id }, values]);

      await updateUser.mutateAsync([
        { projectId: project.id },
        { username: String(values.username) },
      ]);
    },
  });

  const isValid =
    form.values.name !== project?.name ||
    existingUser !== form.values.username ||
    form.values.drain_is_enabled !== project?.drain_rule.is_enabled;

  useEffect(() => {
    const loadUser = async () => {
      if (!project) {
        return;
      }

      try {
        const response = await DexTrade.userGet({ projectId: project.id });
        const username = response?.user ? response.user.username : '';
        setExistingUser(username);
        form.setValue('username', username);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(error.message);
        } else {
          throw new Error('An unknown error occurred');
        }
      }
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  return (
    <Box component="form" onSubmit={form.submit} width="100%">
      <TextFieldWithValidation
        fullWidth
        label="Name"
        name="name"
        form={form}
        margin="normal"
        autoFocus
        onChange={(e) => e.target.value}
      />

      <TextFieldWithValidation
        fullWidth
        label="Dextrade Username"
        name="username"
        form={form}
        margin="normal"
        onChange={(e) => e.target.value}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={form.values.drain_is_enabled}
            onChange={(e) =>
              form.setValue('drain_is_enabled', e.target.checked)
            }
          />
        }
        label="Sweep all payments to hot wallet by default"
      />

      <Box mt={3} display="flex" justifyContent="center">
        <Button
          type="submit"
          disabled={
            !form.isInitiated ||
            !isValid ||
            updateProject.isPending ||
            updateUser.isPending
          }
          loading={updateProject.isPending || updateUser.isPending}
        >
          Update
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectEdit;
