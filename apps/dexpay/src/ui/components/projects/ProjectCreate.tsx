import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { Button, useForm } from 'dex-ui';
import { CopyIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState, useRef } from 'react';

import { useMutation } from '../../hooks/use-query';
import { DexTrade, Projects, Memo } from '../../services';
import { IMemo, IProject } from '../../types';
import { Validation } from '../../validation';
import { TextFieldWithValidation } from '../fields';

interface ProjectCreateProps {
  onCreated: (project: IProject) => void;
  onClose: () => void;
}

const ProjectCreate: React.FC<ProjectCreateProps> = ({
  onCreated,
  onClose,
}) => {
  const [projectData, setProjectData] = useState<IProject | null>(null);
  const [memosList, setMemosList] = useState<IMemo[]>([]);
  const [projectInitStart, setProjectInitStart] = useState(false);
  // eslint-disable-next-line no-undef
  const projectInitIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const createUser = useMutation(DexTrade.userCreate, {
    onSuccess: () => {
      enqueueSnackbar('You created new DexTrade username');
    },
    onError: (error) => {
      enqueueSnackbar(error.message);
    },
  });

  const projectInit = useMutation(Projects.init, {
    onError: (error) => {
      enqueueSnackbar(error.message);
    },
  });

  const form = useForm({
    values: {
      name: '',
      username: '',
      mnemonic_encrypted_id: 0,
      drain_is_enabled: true,
    },
    validationSchema: Validation.Project.create,
    method: async (values) => {
      try {
        const response = await Projects.create({ name: values.name });
        setProjectData(response.data);
        setProjectInitStart(true);

        await projectInit.mutateAsync([
          { id: response.data.id },
          { mnemonic_encrypted_id: values.mnemonic_encrypted_id },
        ]);

        projectInitIntervalRef.current = setInterval(async () => {
          const initResponse = await projectInit.mutateAsync([
            { id: response.data.id },
            { mnemonic_encrypted_id: values.mnemonic_encrypted_id },
          ]);

          if (initResponse.status === 'done') {
            const username = `${values.username}`;
            if (projectInitIntervalRef.current) {
              clearInterval(projectInitIntervalRef.current);
            }

            await Projects.setDrain(
              { id: response.data.id },
              { is_enabled: values.drain_is_enabled },
            );

            setProjectInitStart(false);
            onCreated(response.data);

            if (username) {
              await createUser.mutateAsync([
                { projectId: response.data.id },
                { username },
              ]);
            }
          }
        }, 1500);
      } catch (error: any) {
        enqueueSnackbar(error.message);
      }
    },
  });

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar('Copied to clipboard');
    } catch {
      enqueueSnackbar('Failed to copy');
    }
  };

  useEffect(() => {
    const loadMemos = async () => {
      try {
        const response = await Memo.my({ page: 0, is_imported: 1 });
        setMemosList(response.list.currentPageResult);

        if (response.list.currentPageResult.length === 1) {
          form.setValue(
            'mnemonic_encrypted_id',
            response.list.currentPageResult[0].id,
          );
        }
        form.setValue('drain_is_enabled', true);
      } catch (error: any) {
        enqueueSnackbar(error.message);
      }
    };

    loadMemos();

    return () => {
      if (projectInitIntervalRef.current) {
        clearInterval(projectInitIntervalRef.current);
      }
    };
  }, []);

  if (projectData && !projectInitStart) {
    return (
      <Box width={400}>
        <Typography variant="subtitle1" mb={1}>
          Private Access Key
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextFieldWithValidation
            fullWidth
            value={projectData.private_name}
            InputProps={{ readOnly: true }}
          />
          <CopyIcon
            className="cursor-pointer"
            onClick={() => handleCopy(projectData.private_name)}
          />
        </Box>
        <Box mt={2} display="flex" justifyContent="center">
          <Button onClick={onClose}>Close</Button>
        </Box>
      </Box>
    );
  }

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

      {memosList.length > 1 && (
        <TextFieldWithValidation
          fullWidth
          select
          label="Mnemonic"
          name="mnemonic_encrypted_id"
          form={form}
          margin="normal"
          SelectProps={{
            native: true,
          }}
        >
          {memosList.map((memo) => (
            <option key={memo.id} value={memo.id}>
              {memo.name}
            </option>
          ))}
        </TextFieldWithValidation>
      )}

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
          disabled={Boolean(
            !form.isInitiated || form.primaryError || projectInitStart,
          )}
          loading={projectInitStart}
        >
          {projectInitStart ? 'In process. Please wait...' : 'Create'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectCreate;
