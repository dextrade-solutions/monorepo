import {
  Box,
  Typography,
  MenuList,
  ListItemText,
  Divider,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  TextField,
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

import { useMutation, useQuery } from '../hooks/use-query';
import { useUser } from '../hooks/use-user';
import { Projects } from '../services';
import { TextFieldWithValidation } from '../components/fields';

const inviteUserSchema = yup.object().shape({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
});

const SalespersonsModal = ({ hideModal }: ModalProps) => {
  const { user } = useUser();
  const { showModal } = useGlobalModalContext();
  const loader = useLoader();

  const form = useForm({ validationSchema: inviteUserSchema });

  const [inviteEmail, setInviteEmail] = useState('');

  const usersWithAccess = useQuery(Projects.getUsersWithAccess, {
    projectId: user?.project.id,
    enabled: Boolean(user?.project.id), // Only enable the query if projectId exists
  });

  const inviteUser = useMutation(Projects.inviteUser, {
    onSuccess: () => {
      usersWithAccess.refetch();
      setInviteEmail('');
    },
    onError: (error) => {
      showModal({
        name: 'ALERT_MODAL',
        severity: 'error',
        text: error.message,
      });
    },
  });

  const revokeAccess = useMutation(Projects.revokeAccess, {
    onSuccess: () => {
      usersWithAccess.refetch();
    },
    onError: (error) => {
      showModal({
        name: 'ALERT_MODAL',
        severity: 'error',
        text: error.message,
      });
    },
  });

  const handleInvite = async () => {
    if (!user?.project.id) {
      return; // Or handle the case where user or project is undefined
    }
    try {
      await loader.runLoader(
        inviteUser.mutateAsync([
          { projectId: user.project.id },
          { email: inviteEmail },
        ]),
      );
    } catch (error) {
      // Handle error if needed
      console.error('Failed to invite user:', error);
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!user?.project.id) {
      return; // Handle the case where user or project is undefined
    }

    try {
      await loader.runLoader(
        revokeAccess.mutateAsync([{ projectId: user.project.id, userId }]),
      );
    } catch (error) {
      console.error("Failed to revoke user's access", error);
    }
  };

  return (
    <Box padding={5}>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Typography>Salespersons</Typography>
        <ButtonIcon
          iconName="close"
          color="secondary"
          size="sm"
          onClick={hideModal}
        />
      </Box>

      <Divider />

      <Box sx={{ mt: 2 }}>
        <TextFieldWithValidation
          validationForm={form}
          label="Email"
          name="email"
          fullWidth
          value={inviteEmail}
          onChange={(name, e) => setInviteEmail(e.target.value)}
        />
        <Button
          onClick={handleInvite}
          disabled={inviteUser.isPending || form.primaryError}
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
        >
          Invite User
        </Button>
      </Box>

      {usersWithAccess.isLoading ? (
        <Skeleton variant="rectangular" height={40} sx={{ my: 2 }} />
      ) : (
        <MenuList>
          {(usersWithAccess.data?.currentPageResult || []).map((userAccess) => (
            <Box key={userAccess.user_id}>
              <ListItemButton>
                <ListItemAvatar>
                  <Avatar>{userAccess.user?.email[0]?.toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={userAccess.user?.email} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRevoke(userAccess.user_id)}
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
