import {
  Box,
  Typography,
  MenuList,
  ListItemText,
  Divider,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Button,
  Skeleton,
  IconButton,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ButtonIcon,
  ModalProps,
  useGlobalModalContext,
  useLoader,
  useForm,
} from 'dex-ui';
import { Trash } from 'lucide-react';
import React, { useState } from 'react';
import * as yup from 'yup';

import { TextFieldWithValidation } from '../components/fields';
import { useAuth } from '../hooks/use-auth';
import { useMutation, useQuery } from '../hooks/use-query';
import { Projects } from '../services';

const inviteUserSchema = yup.object().shape({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
});

const SalespersonsModal = ({ hideModal }: ModalProps) => {
  const { user } = useAuth();

  const projectId = user?.project.id!;

  const usersWithAccess = useQuery(Projects.getUsersWithAccess, {
    projectId,
    enabled: Boolean(projectId), // Only enable the query if projectId exists
  });

  const inviteUser = useMutation(Projects.inviteUser, {
    onSuccess: onSuccessInvite,
  });

  const revokeAccess = useMutation(Projects.revokeAccess, {
    onSuccess: () => {
      usersWithAccess.refetch();
    },
  });

  const inviteUserForm = useForm({
    values: {
      email: '',
    },
    validationSchema: inviteUserSchema,
    method: (values) => inviteUser.mutateAsync([{ projectId }, values]),
  });

  const revokeAccessForm = useForm({
    method: (_, userId) => revokeAccess.mutateAsync([{ projectId, userId }]),
  });

  function onSuccessInvite() {
    usersWithAccess.refetch();
    inviteUserForm.reset();
  }

  return (
    <Box padding={5} data-testid="salespersons-modal">
      <Box
        display="flex"
        justifyContent="space-between"
        marginBottom={2}
        data-testid="salespersons-modal-header"
      >
        <Typography data-testid="salespersons-modal-title">
          Salespeople
        </Typography>
        <ButtonIcon
          iconName="close"
          color="secondary"
          size="sm"
          data-testid="salespersons-modal-close-button"
          onClick={hideModal}
        />
      </Box>
      <Divider />
      <Box sx={{ mt: 2 }} data-testid="salespersons-modal-invite-section">
        <TextFieldWithValidation
          data-testid="salespersons-modal-email-input"
          form={inviteUserForm}
          label="Email"
          name="email"
          fullWidth
          onChange={(e) => e.target.value}
        />
        <Button
          onClick={inviteUserForm.submit}
          disabled={inviteUser.isPending || inviteUserForm.primaryError}
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          data-testid="salespersons-modal-invite-button"
        >
          Invite User
        </Button>
      </Box>
      {usersWithAccess.isLoading ? (
        <Skeleton
          variant="rectangular"
          height={40}
          sx={{ my: 2 }}
          data-testid="salespersons-modal-loading-skeleton"
        />
      ) : (
        <MenuList data-testid="salespersons-modal-user-list">
          {(usersWithAccess.data?.currentPageResult || []).map((userAccess) => (
            <Box
              key={userAccess.user_id}
              data-testid={`salespersons-modal-user-item-${userAccess.user_id}`}
            >
              <ListItemButton>
                <ListItemAvatar>
                  <Avatar>{userAccess.user?.email[0]?.toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={userAccess.user?.email} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => revokeAccessForm.submit(userAccess.id)}
                    data-testid={`salespersons-modal-revoke-button-${userAccess.id}`}
                  >
                    <Trash />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
              <Divider />
            </Box>
          ))}
        </MenuList>
      )}
    </Box>
  );
};

export default SalespersonsModal;
