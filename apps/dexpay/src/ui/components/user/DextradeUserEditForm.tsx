import { Box } from '@mui/material';
import { create } from '@mui/material/styles/createTransitions';
import { queryClient } from 'dex-helpers/shared';
import { Button, useForm } from 'dex-ui';
import React, { useEffect } from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useMutation, useQuery } from '../../hooks/use-query';
import { DexTrade } from '../../services';
import { Validation } from '../../validation'; // Assuming you have validation
import { TextFieldWithValidation } from '../fields';

// Interface for form values
interface DextradeUserEditFormValues {
  username: string;
}

const DextradeUserEditForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const projectId = user?.project?.id!; // Get projectId from auth context

  const dextradeUser = useQuery(DexTrade.userGet, [{ projectId }]);

  const savedUsername = dextradeUser.data?.user.username;

  const createUser = useMutation(DexTrade.userUpdate, {
    onSuccess: (_, params) => {
      // Update the local cache with the new username
      const [, payload] = params;
      queryClient.setQueryData(
        [DexTrade.userGet.toString(), [{ projectId }]],
        (oldData: any) => {
          if (oldData) {
            return {
              ...oldData,
              user: {
                ...oldData.user,
                username: payload.username,
              },
            };
          }
          return oldData;
        },
      );
      onSuccess?.();
    },
  });

  const form = useForm<DextradeUserEditFormValues>({
    values: {
      username: '',
    },
    validationSchema: Validation.DexTrade.User.create, // Create this validation schema
    method: async (data: DextradeUserEditFormValues) =>
      createUser.mutateAsync([{ projectId }, data]),
  });
  useEffect(() => {
    if (savedUsername) {
      form.setValue('username', savedUsername);
    }
  }, [savedUsername]);

  return (
    <Box component="form" m={3} onSubmit={form.submit}>
      <TextFieldWithValidation
        label="Username"
        name="username"
        form={form}
        fullWidth
        margin="normal"
        onChange={(e) => e.target.value}
      />
      <Button fullWidth sx={{ mt: 2 }} gradient type="submit">
        Save
      </Button>
    </Box>
  );
};

export default DextradeUserEditForm;
