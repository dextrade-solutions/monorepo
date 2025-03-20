import { Button, useForm } from 'dex-ui';
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
  const { user, me } = useAuth();
  const projectId = user?.project?.id!; // Get projectId from auth context

  const createUser = useMutation(DexTrade.userCreate, { onSuccess });

  const [emailFirstPart] = (me?.email || '').split('@');

  const form = useForm<CreateUserFormValues>({
    values: {
      username: emailFirstPart,
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
      <Button
        fullWidth
        sx={{ mt: 2 }}
        gradient
        type="submit"
        disabled={createUser.isPending}
      >
        {createUser.isPending ? 'Creating...' : 'Create DexTrade User'}
      </Button>
    </form>
  );
};

export default CreateDexTradeUser;
