import { Button } from '@mui/material';
import { GradientButton, useForm } from 'dex-ui';
import React from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useMutation } from '../../hooks/use-query';
import { DexTrade } from '../../services';
import { Validation } from '../../validation'; // Assuming you have validation
import { TextFieldWithValidation } from '../fields';

// Interface for form values
interface CreateUserFormValues {
  username: string;
}

const CreateDexTradeUser = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useAuth();
  const projectId = user?.project?.id!; // Get projectId from auth context

  const createUser = useMutation(DexTrade.userCreate, { onSuccess });

  const form = useForm<CreateUserFormValues>({
    values: {
      username: '',
    },
    validationSchema: Validation.DexTrade.User.create, // Create this validation schema
    method: async (data: CreateUserFormValues) =>
      createUser.mutateAsync([{ projectId }, data]),
  });

  return (
    <form onSubmit={form.submit}>
      <TextFieldWithValidation
        label="Username"
        name="username"
        form={form}
        fullWidth
        margin="normal"
        onChange={(e) => e.target.value}
      />
      <GradientButton type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create DexTrade User'}
      </GradientButton>
    </form>
  );
};

export default CreateDexTradeUser;
