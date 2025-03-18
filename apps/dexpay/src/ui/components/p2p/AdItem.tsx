import {
  Box,
  Divider,
  Stack,
  Typography,
  Paper,
  Collapse,
  IconButton,
  Alert,
} from '@mui/material';
// import { ArrowForward } from 'lucide-react'; // Import the icon
import { DEXTRADE_P2P_LINK, formatCurrency } from 'dex-helpers';
import { CoinModel } from 'dex-helpers/types';
import { AdRun, AssetItem, AssetPriceOutput, Button, CopyData } from 'dex-ui';
import {
  ChevronDown,
  ChevronRight,
  LucideArrowUpRight,
  Trash,
} from 'lucide-react';
import React, { useState } from 'react';

import ItemRow from '../ui/ItemRow';
import StyledLink from '../ui/Link';

interface AdItemProps {
  fromCoin: CoinModel; // Define currency types
  toCoin: CoinModel;
  transactionCount: number;
  earnings: { amount: number; currency: string; usdEquivalent: number };
  exchangeCommission: number;
  profitCommission: number;
  price: number;
  marketPrice: number;
  priceSource: string;
  statusMessage?: string;
  active: boolean;
  exchangerName: string;
  onDelete: (adId: number) => void;
  toggleActive: (adId: number) => void;
  minimumExchangeAmountCoin1: number | null;
  maximumExchangeAmountCoin1: string;
  reversed?: boolean;
}

const AdItem: React.FC<AdItemProps> = ({
  fromCoin,
  toCoin,
  transactionCount = '-',
  earnings = {
    amount: '-',
    usdEquivalent: 0,
  },
  exchangeCommission = '-',
  profitCommission,
  price,
  marketPrice = '-',
  priceSource,
  statusMessage,
  active,
  exchangerName,
  toggleActive,
  onDelete,
  minimumExchangeAmountCoin1,
  maximumExchangeAmountCoin1,
  reversed,
}) => {
  const fromMinAmount = reversed
    ? minimumExchangeAmountCoin1 * price
    : minimumExchangeAmountCoin1;
  const fromMaxAmount = reversed
    ? maximumExchangeAmountCoin1 / price
    : maximumExchangeAmountCoin1;

  const from = reversed ? toCoin : fromCoin;
  const to = reversed ? fromCoin : toCoin;

  const [expanded, setExpanded] = useState({
    options: false,
    statusMessage: false,
  });
  const shortMessage = statusMessage
    ? statusMessage.length > 100
      ? `${statusMessage.substring(0, 100)}...`
      : statusMessage
    : null; // Shortened message

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !expanded[key] }));
  };
  const queryString = `?fromNetworkName=${fromCoin.networkName}&fromTicker=${fromCoin.ticker}&toNetworkName=${toCoin.networkName}&toTicker=${toCoin.ticker}&name=${exchangerName}`;
  const adLink = `${DEXTRADE_P2P_LINK}/swap-view${queryString}`;
  const widgetLink = `${DEXTRADE_P2P_LINK}/swap-widget${queryString}`;

  const widgetCode = `<iframe
      src="${widgetLink}"
      width="100%"
      height="600px"
      title="DexPay Swap"
      className="border-none rounded-lg"
    />`;
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        my: 1,
        p: 2,
        color: 'text.tertiary',
        bgcolor: 'secondary.dark',
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <Typography variant="body2">
          <StyledLink href="/p2p/#history" noUnderline>
            Trades
          </StyledLink>
        </Typography>
        <ChevronRight size={20} />

        <Box ml="auto">
          <IconButton
            color={active ? 'error' : 'success'}
            onClick={() => toggleActive(0)} // fix this
          >
            {active ? <AdRun size={16} /> : <AdRun size={16} />}
          </IconButton>
          <IconButton color="tertiary" onClick={() => onDelete(0)}>
            {' '}
            {/* fix this*/}
            <Trash size={16} />
          </IconButton>
        </Box>
      </Box>
      {statusMessage && (
        <Alert
          severity="error"
          sx={{
            cursor: expanded.statusMessage ? 'auto' : 'pointer',
            mb: 1,
          }}
          onClick={() => toggleExpand('statusMessage')}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: expanded.statusMessage ? 'break-spaces' : 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {expanded.statusMessage ? statusMessage : shortMessage}
          </Typography>
        </Alert>
      )}
      <Divider />
      <Box
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        my={2}
      >
        <AssetItem iconSize={26} coin={from} />
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <svg
            width="27"
            height="27"
            viewBox="0 0 27 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.5"
              y="0.0288086"
              width="26"
              height="26"
              rx="13"
              fill="#3C76FF"
            />
            <g clip-path="url(#clip0_413_7148)">
              <path
                d="M7 13.0288H20"
                stroke="white"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M16.5 16.5288L20 13.0288L16.5 9.52881"
                stroke="white"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_413_7148">
                <rect
                  width="14"
                  height="14"
                  fill="white"
                  transform="translate(6.5 6.02881)"
                />
              </clipPath>
            </defs>
          </svg>
        </Box>

        <AssetItem alignReverse iconSize={26} coin={to} />
      </Box>
      <Divider />
      <Collapse in={expanded.options}>
        <Stack spacing={2} sx={{ mt: 2 }} divider={<Divider />}>
          {active && (
            <Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Button
                  size="small"
                  color="tertiary"
                  onClick={() => {
                    window.open(adLink, '_blank');
                  }}
                  endIcon={<LucideArrowUpRight size={20} />}
                >
                  Open ad
                </Button>
                <div className="flex-grow" />
                <CopyData
                  className="flex-shrink"
                  color="tertiary"
                  shorten
                  data={adLink}
                />
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Button
                  size="small"
                  className="nowrap"
                  color="tertiary"
                  onClick={() => {
                    window.open(widgetLink, '_blank');
                  }}
                  endIcon={<LucideArrowUpRight size={20} />}
                >
                  Widget code
                </Button>
                <div className="flex-grow" />
                <CopyData
                  className="flex-shrink"
                  shorten
                  color="tertiary"
                  data={widgetCode}
                />
              </Box>
            </Box>
          )}
          <ItemRow label="Transaction Count" value={transactionCount} />
          <ItemRow
            label="Earnings"
            value={`${earnings.amount} ${from.ticker} | $${earnings.usdEquivalent.toFixed(2)}`}
          />
          <Box>
            <ItemRow
              label="Exchange Commission"
              value={`${exchangeCommission} ${from.ticker}`}
            />
            <ItemRow label="Profit Commission" value={`${profitCommission}%`} />
          </Box>
          <Box>
            <ItemRow label="Price" value={formatCurrency(price, to.ticker)} />
            <ItemRow
              label="Market Price"
              value={`${marketPrice} ${from.ticker}`}
            />
          </Box>
          <Box>
            <ItemRow
              label={`Minimum Trade Amount`}
              value={
                <AssetPriceOutput
                  amount={fromMinAmount}
                  price={price}
                  tickerFrom={from.ticker}
                  tickerTo={to.ticker}
                  secondary
                />
              }
            />
            <ItemRow
              label={`Maximum Trade Amount`}
              value={
                <AssetPriceOutput
                  amount={fromMaxAmount}
                  price={price}
                  tickerFrom={from.ticker}
                  tickerTo={to.ticker}
                  secondary
                />
              }
            />
          </Box>
          <ItemRow label="Price Source" value={priceSource} />
        </Stack>
      </Collapse>

      <Box
        display="flex"
        justifyContent="center"
        mt={1}
        width="100%"
        onClick={() => toggleExpand('options')}
      >
        <ChevronDown
          style={{ transform: expanded.options ? 'rotate(180deg)' : 'none' }}
        />
      </Box>
    </Paper>
  );
};

export default AdItem;
