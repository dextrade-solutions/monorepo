import {
  Box,
  Button,
  Card,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from '@mui/material';
import { Icon } from 'dex-ui';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import {
  HOME_ROUTE,
  KYC_ROUTE,
  PAYMENT_METHODS_ROUTE,
  SETTINGS_GENERAL_ROUTE,
} from '../../helpers/constants/routes';
import { useI18nContext } from '../../hooks/useI18nContext';

export default function P2PSettings() {
  const t = useI18nContext();
  const navigate = useNavigate();
  const location = useLocation();

  const pathnames = location.pathname.split('/').filter((item) => item);

  return (
    <Box>
      <Box marginBottom={2}>
        <Button
          startIcon={<Icon name="arrow-left-dex" />}
          color="secondary"
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
          <Box display="flex" alignItems="center">
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
            </MenuList>
          )}
        </Box>
        {pathnames.length > 1 && (
          <Box margin={3} marginTop={0}>
            <Outlet />
          </Box>
        )}
      </Card>
    </Box>
  );
}
