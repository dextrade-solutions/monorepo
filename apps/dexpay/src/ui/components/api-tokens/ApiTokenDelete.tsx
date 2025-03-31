import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { useMutation } from '../../hooks/use-query';
import { Tokens } from '../../services';
import type { IApiToken } from '../../types';
import OtpConfirm from '../OtpConfirm';

interface ApiTokenDeleteProps {
  apiToken: IApiToken | null;
  onDeleted: () => void;
  onClose: () => void;
}

const ApiTokenDelete: React.FC<ApiTokenDeleteProps> = ({
  apiToken,
  onDeleted,
  onClose,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [codeToken, setCodeToken] = useState<string | null>(null);

  const deleteRequest = useMutation(Tokens.deleteRequest, {
    onSuccess: (data) => {
      setCodeToken(data.code_token);
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' });
    },
  });

  const deleteConfirm = useMutation(Tokens.deleteConfirm, {
    onSuccess: () => {
      onDeleted();
      onClose();
      enqueueSnackbar('API Token deleted successfully', { variant: 'success' });
      setCodeToken(null);
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' });
    },
  });

  const handleDelete = () => {
    if (apiToken) {
      deleteRequest.mutateAsync({ id: apiToken.id });
    }
  };

  const handleConfirmCode = async (code: string) => {
    if (!apiToken || !codeToken) {
      return;
    }

    await deleteConfirm.mutateAsync({
      id: apiToken.id,
      code,
      code_token: codeToken,
    });
  };

  if (codeToken) {
    return (
      <Card elevation={0} sx={{ bgcolor: 'secondary.dark', borderRadius: 1 }}>
        <CardContent>
          <OtpConfirm method={handleConfirmCode} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Are you sure?
      </Typography>
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          color="success"
          onClick={handleDelete}
          disabled={deleteRequest.isPending}
        >
          Yes
        </Button>
        <Button
          color="error"
          onClick={onClose}
          disabled={deleteRequest.isPending}
        >
          No
        </Button>
      </Box>
    </Box>
  );
};

export default ApiTokenDelete;
