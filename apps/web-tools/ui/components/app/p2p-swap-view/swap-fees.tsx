import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Skeleton,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { formatCurrency, formatFundsAmount } from 'dex-helpers';
import { AssetModel, Tariff } from 'dex-helpers/types';
import { tariffService } from 'dex-services';
import { bgPrimaryGradient, Icon, useGlobalModalContext } from 'dex-ui';
import React, { useCallback, useEffect, useState } from 'react';

import { useAuthWallet } from '../../../hooks/useAuthWallet';
import usePaymodalHandlers from '../../../hooks/usePaymodalHandlers';
import { useI18nContext } from '../../../hooks/useI18nContext';

const TRX_ENERGY_SAVE_FEE = 8; // currently is 8 TRX

export function SwapFees(fees: {
  superFee: boolean;
  loading: boolean;
  inbound: { amount?: number; asset?: AssetModel };
  outbound: { amount?: number; asset?: AssetModel };
}) {
  const paymodalHandlers = usePaymodalHandlers();
  const { showModal } = useGlobalModalContext();
  const [expanded, setExpanded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const t = useI18nContext();

  const { data: tariffLimits } = useQuery<Tariff>({
    queryKey: ['tariffLimit'],
    enabled: fees.superFee,
    queryFn: () => {
      return tariffService.limit().then((response) => response.data as Tariff);
    },
  });
  const isSuperFeeApplied = tariffLimits && tariffLimits.refillGasRequests > 0;

  let outboundAmount = fees.outbound.amount;
  const usdtOutbound =
    (outboundAmount || 0) * (fees.outbound.asset?.priceInUsdt || 0);
  const usdtInbound =
    (fees.inbound.amount || 0) * (fees.inbound.asset?.priceInUsdt || 0);
  const total = usdtOutbound + usdtInbound;

  const reducableFeeOutbound =
    fees.superFee &&
    TRX_ENERGY_SAVE_FEE * (fees.outbound.asset?.priceInUsdt || 0);

  if (isSuperFeeApplied && typeof reducableFeeOutbound === 'number') {
    outboundAmount = TRX_ENERGY_SAVE_FEE;
  }

  const buyPlan = useCallback(() => {
    showModal({
      name: 'BUY_PLAN',
      planName: 'tron energy',
      paymodalHandlers,
    });
  }, [showModal, paymodalHandlers]);

  useEffect(() => {
    if (loggedIn) {
      buyPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  return (
    <Card sx={{ bgcolor: 'secondary.dark' }} variant="outlined">
      <CardActionArea onClick={() => setExpanded(!expanded)}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <Box className="flex-grow">
                {!isSuperFeeApplied && (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mr={2}
                  >
                    <Typography>{t('Total fee')}</Typography>
                    {fees.loading ? (
                      <Skeleton width={70} />
                    ) : (
                      <Typography fontWeight="bold">
                        {formatCurrency(total, 'usd')}
                      </Typography>
                    )}
                  </Box>
                )}
                {typeof reducableFeeOutbound === 'number' && (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box display="flex" alignItems="center">
                      <Typography mr={1}>{t('Super fee')}</Typography>
                      {isSuperFeeApplied && (
                        <>
                          <Typography color="success.light" mr={0.5}>
                            {t('Applied')}
                          </Typography>
                          <Icon color="success.light" name="check" />
                        </>
                      )}
                      {!isSuperFeeApplied && (
                        <Box display="flex" alignItems="center">
                          <Chip
                            clickable
                            sx={{ backgroundImage: bgPrimaryGradient }}
                            icon={<Icon name="info" color="white" />}
                            label={
                              <Typography variant="body2" color="white">
                                {t('Activate')}
                              </Typography>
                            }
                            onClick={() => {
                              buyPlan();
                            }}
                          ></Chip>
                        </Box>
                      )}
                    </Box>
                    <Typography fontWeight="bold" marginRight={2}>
                      {formatCurrency(
                        reducableFeeOutbound + usdtInbound,
                        'usd',
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Icon
                className={classNames('arrow', {
                  'arrow-rotated': expanded,
                })}
                name="arrow-down"
                color="text.secondary"
              />
            </Box>
          }
        />
      </CardActionArea>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {fees.outbound.asset && typeof outboundAmount === 'number' && (
            <Box display="flex" justifyContent="space-between" marginTop={1}>
              <Typography>
                {fees.outbound.asset.isFiat
                  ? t('Exchanger fee')
                  : t('Network outbound')}
              </Typography>
              <Box display="flex">
                <Typography>
                  {formatFundsAmount(
                    outboundAmount,
                    fees.outbound.asset.symbol,
                  )}
                </Typography>
                {fees.outbound.asset.priceInUsdt && (
                  <Typography color="text.secondary" marginLeft={1}>
                    {formatCurrency(
                      outboundAmount * fees.outbound.asset.priceInUsdt,
                      'usd',
                    )}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          {fees.inbound.asset && fees.inbound.amount !== undefined && (
            <Box display="flex" justifyContent="space-between" marginTop={1}>
              <Typography>
                {fees.inbound.asset.isFiat
                  ? t('Exchanger fee')
                  : t('Network inbound')}
              </Typography>
              <Box display="flex">
                <Typography>
                  {formatFundsAmount(
                    fees.inbound.amount,
                    fees.inbound.asset.symbol,
                  )}
                </Typography>
                {fees.inbound.asset.priceInUsdt && (
                  <Typography color="text.secondary" marginLeft={1}>
                    {formatCurrency(
                      fees.inbound.amount * fees.inbound.asset.priceInUsdt,
                      'usd',
                    )}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
