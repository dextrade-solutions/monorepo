import { Button, Box, Typography, Paper, Tab, Divider } from '@mui/material';
import { DEXTRADE_P2P_LINK, formatCurrency } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import {
  bgPrimaryGradient,
  CircleNumber,
  CopyData,
  useGlobalModalContext,
} from 'dex-ui';
import { Code, Plus, User2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useHashLocation } from 'wouter/use-hash-location';

import CreateDexTradeUser from '../components/p2p/CreateDextradeUser';
import Loader from '../components/p2p/Loader';
import TradingPair from '../components/p2p/TradingPair';
import SelectCurrency from '../components/ui/SelectCurrency';
import Tabs from '../components/ui/Tabs';
import DextradeUserEditForm from '../components/user/DextradeUserEditForm';
import { ROUTE_P2P_CREATE } from '../constants/pages';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '../hooks/use-query';
import { DexTrade } from '../services';

export default function P2P() {
  const [_, navigate] = useHashLocation();
  const { user } = useAuth();
  const { showModal, hideModal } = useGlobalModalContext();
  const projectId = user?.project?.id!;

  const [tabValue, setTabValue] = useState('pairs');
  const [embedWidgetDefaultCurrency, setEmbedWidgetDefaultCurrency] =
    useState<AssetModel>();

  const dextradeUser = useQuery(DexTrade.userGet, [{ projectId }]);

  const showConfigureEmbedWidget = () => {
    let queryString = `?name=${dextradeUser.data?.user?.username}`;
    if (embedWidgetDefaultCurrency) {
      queryString += `&toNetworkName=${embedWidgetDefaultCurrency.network}&toTicker=${embedWidgetDefaultCurrency.symbol}`;
    }
    const widgetLink = `${DEXTRADE_P2P_LINK}/swap-widget${queryString}`;
    const widgetCode = `<iframe
        src="${widgetLink}"
        width="100%"
        height="600px"
        title="DexPay Swap"
      />`;

    showModal({
      component: () => (
        <Box m={3} sx={{ mb: 5 }}>
          <Box display="flex" alignItems="center">
            <CircleNumber number={1} size={30} />
            <Typography color="text.secondary" ml={1}>
              Configure your widget
            </Typography>
          </Box>
          <Box mt={2}>
            <SelectCurrency
              fullWidth
              value={embedWidgetDefaultCurrency}
              placeholder="Select default currency"
              variant="contained"
              noZeroBalances
              onChange={(currency) => {
                setEmbedWidgetDefaultCurrency(currency);
              }}
            />
          </Box>
          <Box display="flex" alignItems="center" mt={2}>
            <CircleNumber number={2} size={30} />
            <Typography color="text.secondary" ml={1}>
              Embed this code on your website
            </Typography>
          </Box>
          <CopyData variant="outlined" full data={widgetCode} sx={{ my: 2 }} />
        </Box>
      ),
    });
  };

  useEffect(() => {
    if (embedWidgetDefaultCurrency) {
      showConfigureEmbedWidget();
    }
  }, [embedWidgetDefaultCurrency]);

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
        <Box sx={{ my: 3 }} />
        {/* <Typography variant="body2" color="textSecondary">
          Total income
        </Typography>
        <Typography m={3} variant="h4" fontWeight="bold" color="text.tertiary">
          {formatCurrency('0', 'usd')}
        </Typography> */}

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
            onClick={showConfigureEmbedWidget}
          >
            Embed widget
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
