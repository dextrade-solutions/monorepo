import {
  Box,
  Typography,
  MenuList,
  ListItemText,
  Divider,
  ListItemButton,
  Button,
  ListItemAvatar,
} from '@mui/material';
import { ButtonIcon, ModalProps, useGlobalModalContext } from 'dex-ui';
import { PlusIcon, Tag, Zap } from 'lucide-react';
import React from 'react';

import { CurrencyGroupType } from '../constants/coins';
import { useAuth } from '../hooks/use-auth';
import { IProject } from '../types';

const SelectProject = ({ hideModal }: ModalProps) => {
  const { user, setProject, projects, invoicePreferences } = useAuth();
  const { showModal } = useGlobalModalContext();

  const handleShortcut = (params: {
    isOpenInvoice?: boolean;
    currencyGroupType: CurrencyGroupType;
  }) => {
    showModal({
      name: 'SHORTCUT_NEW_INVOICE',
      ...params,
    });
  };

  const handleSelectProject = (project: IProject) => {
    setProject(project);
    hideModal();
  };

  const renderList = projects.filter((p) => p.id !== user?.project.id);

  return (
    <Box padding={5}>
      <Typography variant="h6" color="text.tertiary" fontWeight="bold">
        Shortcuts
      </Typography>

      {invoicePreferences && (
        <ListItemButton
          sx={{ color: 'text.tertiary' }}
          onClick={() =>
            handleShortcut({ currencyGroupType: CurrencyGroupType.my })
          }
        >
          <ListItemAvatar>
            <Zap size={16} opacity={0.5} />
            <Tag />
          </ListItemAvatar>
          <ListItemText
            primary="New invoice"
            secondary="With your saved prefrencies"
          />
        </ListItemButton>
      )}
      <ListItemButton
        sx={{ color: 'text.tertiary' }}
        onClick={() =>
          handleShortcut({ currencyGroupType: CurrencyGroupType.mostPopular })
        }
      >
        <ListItemAvatar>
          <Zap size={16} opacity={0.5} />
          <Tag />
        </ListItemAvatar>
        <ListItemText
          primary="Invoice with most popular crypto"
          secondary="USDT, TRX, BTC, ETH, SOL, BNB"
        />
      </ListItemButton>
      <ListItemButton
        sx={{ color: 'text.tertiary' }}
        onClick={() =>
          handleShortcut({ currencyGroupType: CurrencyGroupType.usdt })
        }
      >
        <ListItemAvatar>
          <Zap size={16} opacity={0.5} />
          <Tag />
        </ListItemAvatar>
        <ListItemText primary="USDT Invoice" secondary="On all networks" />
      </ListItemButton>

      <Divider sx={{ my: 2 }} />
      <Box>
        <Typography variant="h6" color="text.tertiary" fontWeight="bold">
          Projects
        </Typography>
        <MenuList>
          {renderList.map((project) => (
            <ListItemButton
              sx={{ color: 'text.tertiary' }}
              key={project.id}
              onClick={() => handleSelectProject(project)}
            >
              <ListItemText>{project.name}</ListItemText>
            </ListItemButton>
          ))}
        </MenuList>
        <Button variant="contained" fullWidth endIcon={<PlusIcon />}>
          New project
        </Button>
      </Box>
    </Box>
  );
};

export default SelectProject;
