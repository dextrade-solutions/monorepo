import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Dialog,
  IconButton,
} from '@mui/material';
import { useForm } from 'dex-ui';
import { Copy } from 'lucide-react';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { useMutation } from '../../hooks/use-query';
import { Tokens } from '../../services';
import { Validation } from '../../validation';
import { TextFieldWithValidation } from '../fields';
import OtpConfirm from '../OtpConfirm'; // Assuming you have this component

interface ApiTokenCreateProps {
  onCreated: () => void;
}

const ApiTokenCreate: React.FC<ApiTokenCreateProps> = ({ onCreated }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [codeToken, setCodeToken] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<{
    token: string;
    secret: string;
  } | null>(null);

  const createRequest = useMutation(Tokens.createRequest);
  const createConfirm = useMutation(Tokens.createConfirm);

  const form = useForm({
    values: {
      api_token_name: '',
    },
    validationSchema: Validation.ApiToken.request,
    method: async (values) => {
      try {
        const response = await createRequest.mutateAsync(values);
        setCodeToken(response.code_token);
      } catch (error) {
        enqueueSnackbar(error.message, { variant: 'error' });
        throw error;
      }
    },
  });

  const handleConfirmCode = async (code: string) => {
    if (!codeToken) {
      return;
    }

    try {
      const response = await createConfirm.mutateAsync({
        api_token_name: form.values.api_token_name,
        code,
        code_token: codeToken,
      });

      setCredentials(response.credentials);
      setShowCredentials(true);
      setCodeToken(null);
      form.reset();
      onCreated();
      enqueueSnackbar('API Token created successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
      throw error;
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar('Copied to clipboard', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to copy', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 'md', mx: 'auto', mb: 4 }}>
      <Card elevation={0} sx={{ bgcolor: 'secondary.dark', borderRadius: 1 }}>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom>
            Create API Token
          </Typography>

          {codeToken ? (
            <OtpConfirm
              method={handleConfirmCode}
              isLoading={createConfirm.isPending}
            />
          ) : (
            <Box component="form" onSubmit={form.submit}>
              <TextFieldWithValidation
                fullWidth
                label="Name"
                name="api_token_name"
                form={form}
                autoFocus
                sx={{ mt: 2 }}
                onChange={(e) => e.target.value}
              />
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={createRequest.isPending}
                >
                  Create
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showCredentials}
        onClose={() => setShowCredentials(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" align="center" gutterBottom>
            API Token Created
          </Typography>
          <Typography align="center" sx={{ mt: 2, mb: 3 }}>
            Please copy these credentials and store them safely. You won't be
            able to see them again.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Token
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                value={credentials?.token}
                InputProps={{ readOnly: true }}
              />
              <IconButton
                size="small"
                onClick={() => handleCopy(credentials?.token || '')}
              >
                <Copy size={16} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Secret
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                value={credentials?.secret}
                InputProps={{ readOnly: true }}
              />
              <IconButton
                size="small"
                onClick={() => handleCopy(credentials?.secret || '')}
              >
                <Copy size={16} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => setShowCredentials(false)}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ApiTokenCreate;
