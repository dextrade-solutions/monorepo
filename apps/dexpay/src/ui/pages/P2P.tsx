import { Button, Box, Typography, Paper, Tab, Divider } from '@mui/material';
import { DEXTRADE_P2P_LINK, formatCurrency } from 'dex-helpers';
import { bgPrimaryGradient, CopyData, useGlobalModalContext } from 'dex-ui';
import { Code, Plus, User2 } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation } from 'wouter';

import CreateDexTradeUser from '../components/p2p/CreateDextradeUser';
import Loader from '../components/p2p/Loader';
import TradingPair from '../components/p2p/TradingPair';
import Tabs from '../components/ui/Tabs';
import DextradeUserEditForm from '../components/user/DextradeUserEditForm';
import { ROUTE_P2P_CREATE } from '../constants/pages';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '../hooks/use-query';
import { DexTrade } from '../services';

export default function P2P() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { showModal, hideModal } = useGlobalModalContext();
  const projectId = user?.project?.id!;

  const [tabValue, setTabValue] = useState('pairs');

  const dextradeUser = useQuery(DexTrade.userGet, [{ projectId }]);

  const queryString = `?name=${dextradeUser.data?.user.username}`;
  const widgetLink = `${DEXTRADE_P2P_LINK}/swap-widget${queryString}`;
  const widgetCode = `<iframe
      src="${widgetLink}"
      width="100%"
      height="600px"
      title="DexPay Swap"
      className="border-none rounded-lg"
    />`;

  if (dextradeUser.isLoading) {
    return <Loader />;
  }

  if (!dextradeUser.data?.user) {
    return (
      <Box>
        <Typography mb={0} color="text.secondary" paragraph>
          To create liquidity on{' '}
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
    <Box>
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
          <Button
            onClick={() =>
              showModal({
                component: () => {
                  return <DextradeUserEditForm onSuccess={hideModal} />;
                },
              })
            }
          >
            <Typography display="flex" fontWeight="bold" color="text.tertiary">
              <Box mr={1}>
                <User2 />
              </Box>
              {dextradeUser.data.user.username}
            </Typography>
          </Button>
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
        <Box display="flex" mt={2}>
          <Button
            fullWidth
            color="tertiary"
            size="large"
            variant="outlined"
            startIcon={<Code />}
            onClick={() =>
              showModal({
                component: () => (
                  <Box m={3} sx={{ p: 2, mb: 5 }}>
                    <Typography color="text.secondary">
                      You will be see all enabled pairs, place this code to your
                      site:
                    </Typography>
                    <CopyData data={widgetCode} sx={{ my: 2 }} />
                  </Box>
                ),
              })
            }
          >
            Get widget code
          </Button>
        </Box>
      </Paper>

      <Tabs
        value={tabValue}
        onChange={(event, newValue) => setTabValue(newValue)}
        variant="fullWidth"
      >
        <Tab label="Pairs" value="pairs" />
        <Tab disabled label="Trades History" value="trades" />
      </Tabs>

      <Box mt={2}>
        {tabValue === 'pairs' && <TradingPair />}
        {tabValue === 'trades' && <TradingPair />}
      </Box>
    </Box>
  );
}
