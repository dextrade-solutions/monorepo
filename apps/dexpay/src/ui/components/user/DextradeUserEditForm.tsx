import { Box, Avatar, IconButton, Typography } from '@mui/material';
import { queryClient } from 'dex-helpers/shared';
import { Button, useForm } from 'dex-ui';
import { Edit } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useMutation, useQuery } from '../../hooks/use-query';
import { DexTrade, Profile } from '../../services';
import { Validation } from '../../validation';
import { TextFieldWithValidation } from '../fields';

interface DextradeUserEditFormValues {
  username: string;
  avatar?: File;
}

const DextradeUserEditForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const projectId = user?.project?.id!;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null); // Create a ref for the username input

  const dextradeUser = useQuery(DexTrade.userGet, [{ projectId }]);

  const savedUsername = dextradeUser.data?.user.username;
  const savedAvatar = dextradeUser.data?.user.avatar;

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    savedAvatar || null,
  );

  const uploadAvatar = useMutation(Profile.uploadAvatar);

  const updateUser = useMutation(DexTrade.userUpdate, {
    onSuccess: (_, params) => {
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
                avatar: payload.avatar,
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
      avatar: undefined,
    },
    validationSchema: Validation.DexTrade.User.create,
    method: async (data: DextradeUserEditFormValues) => {
      let avatarUrl: string | undefined;
      if (data.avatar) {
        const formData = new FormData();
        formData.append('file', data.avatar);
        const uploadResponse = await uploadAvatar.mutateAsync([
          { projectId },
          formData,
        ]);
        avatarUrl = uploadResponse.url;
      }

      return updateUser.mutateAsync([
        { projectId },
        { username: data.username, avatar: avatarUrl }, // Pass avatarUrl here
      ]);
    },
  });

  useEffect(() => {
    if (savedUsername) {
      form.setValue('username', savedUsername);
    }
    // Focus on the username input after the component mounts or updates
    usernameInputRef.current?.focus();
  }, [savedUsername]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('avatar', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box component="form" m={3} onSubmit={form.submit}>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar
          src={avatarPreview}
          sx={{
            width: 60,
            height: 60,
            mr: 2,
            cursor: 'pointer',
            bgcolor: 'tertiary.dark',
          }}
          onClick={handleAvatarClick}
        />
        <IconButton
          onClick={handleAvatarClick}
          color="tertiary"
          sx={{
            position: 'relative',
            top: 20,
            left: -35,
            bgcolor: 'background.paper',
          }}
        >
          <Edit size={20} />
        </IconButton>
        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />

        <TextFieldWithValidation
          label="Username"
          name="username"
          placeholder="Username"
          variant="standard"
          form={form}
          fullWidth
          margin="normal"
          inputRef={usernameInputRef} // Attach the ref to the input
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: 25,
            },
          }}
          onChange={(e) => e.target.value}
        />
      </Box>
      <Button gradient fullWidth sx={{ mt: 2 }} type="submit">
        Save
      </Button>
    </Box>
  );
};

export default DextradeUserEditForm;
