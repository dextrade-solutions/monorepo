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
import React, { useMemo, useState } from 'react';

import ProjectCreate from '../components/projects/ProjectCreate';
import ProjectDelete from '../components/projects/ProjectDelete';
import ProjectEdit from '../components/projects/ProjectEdit';
import { CurrencyGroupType } from '../constants/coins';
import { useAuth } from '../hooks/use-auth';
import { IProject } from '../types';

type Tabs = 'index' | 'add' | 'edit' | 'delete';

const SelectProject = ({ hideModal }: ModalProps) => {
  const { setProject, projects, invoicePreferences, refreshProjects } =
    useAuth();
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

  const [tab, setTab] = useState<Tabs>('index');
  const [editProject, setEditProject] = useState<IProject | null>(null);
  const [deleteProject, setDeleteProject] = useState<IProject | null>(null);

  const handleSelectProject = (project: IProject) => {
    setProject(project);
    hideModal();
  };

  const handleNewProject = () => {
    setTab('add');
  };

  const handleEditProject = (project: IProject) => {
    setEditProject(project);
    setTab('edit');
  };

  const handleDeleteProject = (project: IProject) => {
    setDeleteProject(project);
    setTab('delete');
  };

  const renderList = useMemo(() => projects, [projects]);

  switch (tab) {
    case 'add':
      return (
        <Box padding={4}>
          <ProjectCreate
            onCreated={() => {
              setTab('index');
              refreshProjects();
            }}
            onClose={() => {
              setTab('index');
            }}
          />
        </Box>
      );
    case 'edit':
      return (
        <Box padding={4}>
          <ProjectEdit
            project={editProject}
            onUpdated={() => {
              setTab('index');
              setEditProject(null);
              refreshProjects();
            }}
            onClose={() => {
              setTab('index');
              setEditProject(null);
            }}
          />
        </Box>
      );
    case 'delete':
      return (
        <Box padding={4}>
          <ProjectDelete
            project={deleteProject}
            onDeleted={() => {
              setTab('index');
              setDeleteProject(null);
              refreshProjects();
            }}
            onClose={() => {
              setTab('index');
              setDeleteProject(null);
            }}
          />
        </Box>
      );
    case 'index':
    default:
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
              handleShortcut({
                currencyGroupType: CurrencyGroupType.mostPopular,
              })
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
              {renderList?.map((project) => (
                <Box
                  key={project.id}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <ListItemButton
                    sx={{ color: 'text.tertiary' }}
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                  >
                    <ListItemText>{project.name}</ListItemText>
                  </ListItemButton>
                  <ButtonIcon
                    iconName="edit"
                    color="secondary"
                    size="sm"
                    onClick={() => handleEditProject(project)}
                  />
                  <ButtonIcon
                    iconName="trash"
                    color="error"
                    size="sm"
                    onClick={() => handleDeleteProject(project)}
                  />
                </Box>
              ))}
            </MenuList>
            <Button
              variant="contained"
              fullWidth
              endIcon={<PlusIcon />}
              onClick={handleNewProject}
            >
              New project
            </Button>
          </Box>
        </Box>
      );
  }
};

export default SelectProject;
