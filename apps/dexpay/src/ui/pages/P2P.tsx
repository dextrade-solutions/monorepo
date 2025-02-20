import {
  Button,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Chip,
  Divider,
} from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import { bgPrimaryGradient } from 'dex-ui';
import { Plus, User, User2 } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation } from 'wouter';

import TradingPair from '../components/crypto/TradingPair';
import CreateDexTradeUser from '../components/p2p/createDextradeUser';
import Loader from '../components/p2p/Loader';
import StyledLink from '../components/ui/Link';
import { ROUTE_P2P_CREATE } from '../constants/pages';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '../hooks/use-query';
import { DexTrade } from '../services';

export default function P2P() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const projectId = user?.project?.id!;

  const [tabValue, setTabValue] = useState('pairs');

  const dextradeUser = useQuery(DexTrade.userGet, [{ projectId }]);

  if (dextradeUser.isLoading) {
    return <Loader />;
  }

  if (!dextradeUser.data?.user) {
    return (
      <Box>
        <Typography mb={0} color="text.secondary" paragraph>
          To start trading on{' '}
          <Typography
            component="a"
            href="https://p2p.dextrade.com"
            target="_blank"
          >
            p2p.dextrade.com
          </Typography>{' '}
          please pick username
        </Typography>
        <CreateDexTradeUser onSuccess={dextradeUser.refetch} />
      </Box>
    );
  }

  return (
    <Box sx={{ mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{ textAlign: 'center', bgcolor: 'secondary.dark', p: 2, mb: 5 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Typography display="flex" fontWeight="bold" color="text.tertiary">
            <Box mr={1}>
              <User2 />
            </Box>
            {dextradeUser.data.user.username}
          </Typography>
          <Box textAlign="right">
            <Typography
              component="div"
              variant="caption"
              color="text.secondary"
            >
              Trading platform
            </Typography>
            <Typography
              component="a"
              variant="body2"
              href="https://p2p.dextrade.com"
              target="_blank"
              color="text.tertiary"
            >
              p2p.dextrade.com
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="textSecondary">
          Total income
        </Typography>
        <Typography m={3} variant="h4" fontWeight="bold" color="text.tertiary">
          {formatCurrency('0', 'usd')} USD
        </Typography>

        <Box display="flex" gap={2}>
          <Button
            fullWidth
            color="secondary"
            size="large"
            sx={{ background: bgPrimaryGradient }}
            variant="contained"
            startIcon={<Plus />}
            onClick={() => navigate(ROUTE_P2P_CREATE)}
          >
            Create ad
          </Button>
        </Box>
      </Paper>

      <Tabs
        value={tabValue}
        onChange={(event, newValue) => setTabValue(newValue)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Pairs" value="pairs" />
        <Tab label="Trades History" value="trades" />
      </Tabs>

      <Box mt={2}>
        {tabValue === 'pairs' && <TradingPair />}
        {tabValue === 'trades' && <TradingPair />}
      </Box>
    </Box>
  );
}
