import {
  Box,
  Button,
  Card,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Skeleton,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { UserModel } from 'dex-helpers/types';
import { userService } from 'dex-services';
import { ButtonIcon, Icon, UserAvatar } from 'dex-ui';
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import {
  HOME_ROUTE,
  KYC_ROUTE,
  PAYMENT_METHODS_ROUTE,
  PLANS_ROUTE,
  SETTINGS_GENERAL_ROUTE,
} from '../../helpers/constants/routes';
import { useAuthP2P } from '../../hooks/useAuthP2P';
import { useI18nContext } from '../../hooks/useI18nContext';

export default function P2PSettings() {
  const t = useI18nContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthP2P();

  const { isLoading, data: user } = useQuery<UserModel>({
    queryKey: ['dextradeUser'],
    queryFn: () => userService.current().then((response) => response.data),
  });

  const pathnames = location.pathname.split('/').filter((item) => item);

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box>
      <Box display="flex" marginBottom={2} paddingX={1}>
        <Typography variant="h6">User info</Typography>
        <div className="flex-grow" />
        <Button
          startIcon={<Icon name="arrow-left-dex" />}
          color="secondary"
          variant="contained"
          onClick={() => navigate(HOME_ROUTE)}
        >
          {t('back')}
        </Button>
      </Box>
      <Card
        className="overflow-unset"
        variant="outlined"
        sx={{ bgcolor: 'primary.light' }}
      >
        <Box padding={2}>
          <Box margin={2}>
            {isLoading ? (
              <Box display="flex">
                <Skeleton variant="circular" width={40} height={40} />
                <Box display="flex" marginLeft={1}>
                  <Skeleton width={100} />
                </Box>
                <Box className="flex-grow" />
                <Skeleton width={70} />
                <Box display="flex" marginLeft={1}>
                  <Skeleton width={30} />
                </Box>
              </Box>
            ) : (
              <Box display="flex" alignItems="center">
                <UserAvatar name={user?.name} />
                <Typography marginLeft={1} fontWeight="bold">
                  {user?.name}
                </Typography>
                <Box className="flex-grow" />
                <Box marginLeft={1}>
                  <ButtonIcon
                    iconName="logout"
                    size="lg"
                    color="primary"
                    onClick={onLogout}
                  />
                </Box>
              </Box>
            )}
          </Box>
          <Box display="flex" alignItems="center" marginTop={3}>
            {pathnames.map((value, index) => {
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;
              return (
                <>
                  {isLast ? (
                    <Typography
                      key={value}
                      variant="h6"
                      marginLeft={2}
                      color="text.secondary"
                    >
                      {t(value)}
                    </Typography>
                  ) : (
                    <Typography
                      key={value}
                      className="cursor-pointer"
                      variant="h6"
                      marginLeft={2}
                      marginRight={2}
                      onClick={() => navigate(to)}
                    >
                      {t(value)}
                    </Typography>
                  )}
                  {!isLast && (
                    <Icon
                      key={`${value}-chevron`}
                      name="arrow-right"
                      color="primary"
                      size="sm"
                    />
                  )}
                </>
              );
            })}
          </Box>
          {pathnames.length === 1 && (
            <MenuList>
              <MenuItem onClick={() => navigate(SETTINGS_GENERAL_ROUTE)}>
                <ListItemIcon>
                  <Icon name="setting-dex" color="secondary" />
                </ListItemIcon>
                <ListItemText>{t('general')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => navigate(PAYMENT_METHODS_ROUTE)}>
                <ListItemIcon>
                  <Icon name="setting-dex-2" color="primary" />
                </ListItemIcon>
                <ListItemText>{t('payment-methods')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => navigate(KYC_ROUTE)}>
                <ListItemIcon>
                  <Icon name="info" color="secondary" />
                </ListItemIcon>
                <ListItemText>{t('kyc')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => navigate(PLANS_ROUTE)}>
                <ListItemIcon>
                  <Icon name="card" color="secondary" />
                </ListItemIcon>
                <ListItemText>{t('plans')}</ListItemText>
              </MenuItem>
            </MenuList>
          )}
        </Box>
        {pathnames.length > 1 && (
          <Box padding={3} paddingTop={0} marginTop={0}>
            <Outlet />
          </Box>
        )}
      </Card>
    </Box>
  );
}
