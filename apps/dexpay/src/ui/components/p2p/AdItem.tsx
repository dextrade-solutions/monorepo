import {
  Box,
  Divider,
  Stack,
  Typography,
  Paper,
  Collapse,
  IconButton,
  Alert,
  Modal,
} from '@mui/material';
// import { ArrowForward } from 'lucide-react'; // Import the icon
import { DEXTRADE_P2P_LINK } from 'dex-helpers';
import { CoinModel } from 'dex-helpers/types';
import { AssetItem, AssetPriceOutput, Button, CopyData, useForm } from 'dex-ui';
import {
  ChevronDown,
  ChevronRight,
  LucideArrowUpRight,
  Trash,
  Play,
  Pause,
  Pencil,
} from 'lucide-react';
import React, { useState } from 'react';

import { useAuth } from '../../hooks/use-auth';
import { IAdvert } from '../../types';
import { TextFieldWithValidation } from '../fields';
import ItemRow from '../ui/ItemRow';
import StyledLink from '../ui/Link';

interface AdItemProps {
  advert: IAdvert;
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

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  advert: {
    details: {
      id: number;
      minimumExchangeAmountCoin1: number;
      maximumExchangeAmountCoin1: number;
      priceAdjustment: number;
      transactionFee: number;
      exchangersPolicy: string;
    };
  };
}

const EditModal: React.FC<EditModalProps> = ({ open, onClose, advert }) => {
  const { user } = useAuth();
  const projectId = user?.project?.id!;

  const form = useForm({
    values: {
      minimumExchangeAmountCoin1: advert.details.minimumExchangeAmountCoin1,
      maximumExchangeAmountCoin1: advert.details.maximumExchangeAmountCoin1,
      priceAdjustment: advert.details.priceAdjustment,
      transactionFee: advert.details.transactionFee,
      exchangersPolicy: advert.details.exchangersPolicy,
    },
    method: async (values) => {
      await updateAd.mutateAsync([
        { projectId },
        {
          dextrade_id: advert.details.id,
          settingsMain: {
            minimumExchangeAmountCoin1: String(
              values.minimumExchangeAmountCoin1,
            ),
            maximumExchangeAmountCoin1: String(
              values.maximumExchangeAmountCoin1,
            ),
            priceAdjustment: String(values.priceAdjustment),
            transactionFee: String(values.transactionFee),
          },
          exchangersPolicy: values.exchangersPolicy,
        },
      ]);
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 1,
          p: 4,
        }}
      >
        <Typography variant="h6" mb={2}>
          Edit Advertisement
        </Typography>
        <Box component="form" onSubmit={form.submit}>
          <Stack spacing={2}>
            <TextFieldWithValidation
              fullWidth
              label="Minimum Exchange Amount"
              name="minimumExchangeAmountCoin1"
              type="number"
              value={form.values.minimumExchangeAmountCoin1}
              onChange={(e) => e.target.value}
              error={Boolean(form.errors.minimumExchangeAmountCoin1)}
              helperText={form.errors.minimumExchangeAmountCoin1}
            />
            <TextFieldWithValidation
              fullWidth
              label="Maximum Exchange Amount"
              name="maximumExchangeAmountCoin1"
              type="number"
              value={form.values.maximumExchangeAmountCoin1}
              onChange={(e) => e.target.value}
              error={Boolean(form.errors.maximumExchangeAmountCoin1)}
              helperText={form.errors.maximumExchangeAmountCoin1}
            />
            <TextFieldWithValidation
              fullWidth
              label="Price Adjustment"
              name="priceAdjustment"
              type="number"
              value={form.values.priceAdjustment}
              onChange={(e) => e.target.value}
              error={Boolean(form.errors.priceAdjustment)}
              helperText={form.errors.priceAdjustment}
            />
            <TextFieldWithValidation
              fullWidth
              label="Transaction Fee"
              name="transactionFee"
              value={form.values.transactionFee}
              onChange={(e) => e.target.value}
              error={Boolean(form.errors.transactionFee)}
              helperText={form.errors.transactionFee}
            />
            <TextFieldWithValidation
              fullWidth
              label="Exchangers Policy"
              name="exchangersPolicy"
              value={form.values.exchangersPolicy}
              onChange={(e) => e.target.value}
              error={Boolean(form.errors.exchangersPolicy)}
              helperText={form.errors.exchangersPolicy}
            />
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button color="tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save Changes
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

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
  advert,
}) => {
  const fromMinAmount = reversed
    ? minimumExchangeAmountCoin1 * price
    : minimumExchangeAmountCoin1;
  const fromMaxAmount = reversed
    ? maximumExchangeAmountCoin1 * price
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

  // Add state for modal
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Add openEditModal function
  const openEditModal = () => setEditModalOpen(true);
  const closeEditModal = () => setEditModalOpen(false);

  return (
    <>
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
            {/* <IconButton
              data-testid="ad-edit"
              color="tertiary"
              onClick={openEditModal}
            >
              <Pencil size={16} />
            </IconButton> */}
            <IconButton
              data-testid="ad-toggle-active"
              color={active ? 'error' : 'success'}
              onClick={() => toggleActive(0)}
            >
              {active ? <Pause size={16} /> : <Play size={16} />}
            </IconButton>
            <IconButton
              data-testid="ad-delete"
              color="tertiary"
              onClick={() => onDelete(0)}
            >
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
                    data-testid="ad-open"
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
                {/* <Box
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
                </Box> */}
              </Box>
            )}
            <ItemRow
              data-testid="tx-count"
              label="Transaction Count"
              value={transactionCount}
            />
            <ItemRow
              data-testid="ad-earnings"
              label="Earnings"
              value={`${earnings.amount} ${from.ticker} | $${earnings.usdEquivalent.toFixed(2)}`}
            />
            <Box>
              <ItemRow
                data-testid="ad-exchange-comission"
                label="Exchange Commission"
                value={`${exchangeCommission} ${from.ticker}`}
              />
              <ItemRow
                label="Profit Commission"
                value={`${profitCommission}%`}
              />
            </Box>
            <Box>
              <ItemRow
                data-testid="ad-price"
                label="Price"
                value={
                  <AssetPriceOutput
                    price={reversed ? 1 / price : price}
                    tickerFrom={from.ticker}
                    tickerTo={to.ticker}
                  />
                }
              />
              <ItemRow
                data-testid="ad-market-price"
                label="Market Price"
                value={`${marketPrice} ${from.ticker}`}
              />
            </Box>
            <Box>
              <ItemRow
                data-testid="min-trade-amount"
                label={`Min Trade Amount`}
                value={
                  <AssetPriceOutput
                    amount={fromMinAmount}
                    price={price}
                    tickerFrom={from.ticker}
                    tickerTo={to.ticker}
                  />
                }
              />
              <ItemRow
                data-testid="max-trade-amount"
                label={`Max Trade Amount`}
                value={
                  <AssetPriceOutput
                    amount={fromMaxAmount}
                    price={price}
                    tickerFrom={from.ticker}
                    tickerTo={to.ticker}
                  />
                }
              />
            </Box>
            <ItemRow
              data-testid="price-source"
              label="Price Source"
              value={priceSource}
            />
          </Stack>
        </Collapse>

        <Box
          display="flex"
          justifyContent="center"
          mt={1}
          width="100%"
          data-testid="toggle-expand"
          onClick={() => toggleExpand('options')}
        >
          <ChevronDown
            style={{ transform: expanded.options ? 'rotate(180deg)' : 'none' }}
          />
        </Box>
      </Paper>

      <EditModal
        open={editModalOpen}
        onClose={closeEditModal}
        advert={advert}
      />
    </>
  );
};

export default AdItem;
