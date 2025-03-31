import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import ApiTokenCreate from '../components/api-tokens/ApiTokenCreate';
import ApiTokenDelete from '../components/api-tokens/ApiTokenDelete';
import { Tokens } from '../services';
import type { IApiToken } from '../types';

export default function ApiKeys() {
  const [page, setPage] = useState(0);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<IApiToken | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['api-tokens', page],
    queryFn: () => Tokens.list({ page }),
  });

  const handleDelete = (token: IApiToken) => {
    setSelectedToken(token);
    setDeleteModal(true);
  };

  const onDeleted = () => {
    setDeleteModal(false);
    setSelectedToken(null);
    refetch();
  };

  return (
    <Box>
      <ApiTokenCreate
        onCreated={() => {
          // Refresh the tokens list
          refetch();
        }}
      />

      <Card
        elevation={0}
        sx={{ bgcolor: 'secondary.dark', borderRadius: 1, mt: 3 }}
      >
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50}></TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.currentPageResult.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(token)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                    <TableCell>{token.id}</TableCell>
                    <TableCell>{token.label}</TableCell>
                    <TableCell>
                      {new Date(token.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && !data?.currentPageResult.length && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography>No data</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Delete API Token: {selectedToken?.label}
          </Typography>
          <ApiTokenDelete
            apiToken={selectedToken}
            onDeleted={onDeleted}
            onClose={() => setDeleteModal(false)}
          />
        </Box>
      </Dialog>
    </Box>
  );
}
