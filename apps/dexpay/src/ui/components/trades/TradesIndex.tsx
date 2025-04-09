import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  TextField,
  Paper,
  Pagination,
  Stack,
  Divider,
} from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import { debounce, sumBy } from 'lodash';
import { Copy } from 'lucide-react';
import React, { useState, useCallback, useMemo } from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useQuery } from '../../hooks/use-query';
import { Trade } from '../../services';
import { UserPermissions, TradeStatuses } from '../../types/enums';
import ItemRow from '../ui/ItemRow'; // Reusing your existing ItemRow component

const LIMIT = 20;

// interface Filters {
//   external_id: string | null;
// }

interface QueryParams {
  page: number;
  [key: string]: unknown;
}

export default function TradesIndex() {
  const { user, me } = useAuth();
  // const [filters, setFilters] = useState<Filters>({
  //   external_id: null,
  // });
  const [queryParams, setQueryParams] = useState<QueryParams>({ page: 0 });

  const isAdmin = useMemo(() => {
    return me?.permissions?.some(
      (permission) =>
        permission.permission_type === UserPermissions.CANCELED &&
        permission.is_enabled,
    );
  }, [me]);

  // Query for trades based on role
  const { data: tradesData } = useQuery(
    // eslint-disable-next-line no-nested-ternary
    isAdmin
      ? Trade.listBy
      : user?.project?.id
        ? (params) =>
            Trade.listByProject({ projectId: user?.project?.id }, params)
        : Trade.listSearch,
    queryParams,
  );

  const trades = tradesData?.currentPageResult || [];
  const totalRecords = (tradesData?.totalPages || 0) * LIMIT;

  const { data: pnlData } = useQuery(
    user?.project?.id ? Trade.getPNL : null,
    user?.project?.id ? { projectId: user.project.id } : undefined,
  );

  const totalPnlUsdt = useMemo(
    () =>
      sumBy(pnlData?.pnl || [], (pnl) => Number(pnl.pnl_usdt) || 0).toString(),
    [pnlData],
  );

  const pnlColor = useMemo(() => {
    if (Number(totalPnlUsdt) > 0) return 'success.main';
    if (Number(totalPnlUsdt) < 0) return 'error.main';
    return 'text.primary';
  }, [totalPnlUsdt]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePageChange = (_: any, newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  const handleFilter = useCallback(
    debounce((field: string, value: string) => {
      setQueryParams((prev) => {
        const next = { ...prev, page: 0 };
        if (value) {
          next[field] = value;
        } else {
          delete next[field];
        }
        return next;
      });
    }, 500),
    [],
  );

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    // You can add a toast notification here if needed
  };

  return (
    <Box p={2}>
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'secondary.dark',
          borderRadius: 1,
          p: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Trades</Typography>
          <TextField
            size="small"
            placeholder="Search Swap ID"
            onChange={(e) => handleFilter('external_id', e.target.value)}
            sx={{ flexGrow: 1 }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mt: 2,
          }}
        >
          <Typography color="text.secondary">Total PNL</Typography>
          <Typography
            variant="h6"
            sx={{
              color: pnlColor,
              fontWeight: 500,
            }}
          >
            {/* eslint-disable-next-line no-nested-ternary */}
            {Number(totalPnlUsdt) > 0 ? '+' : ''}
            {Math.abs(Number(totalPnlUsdt)) < 0.01 && Number(totalPnlUsdt) !== 0
              ? `${Number(totalPnlUsdt) < 0 ? '-' : ''} <$0.01`
              : formatCurrency(totalPnlUsdt, 'usd')}
          </Typography>
        </Box>
      </Paper>

      {trades.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          No data
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {trades.map((trade) => (
            <Grid item xs={12} sm={6} md={4} key={trade.id}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: 'secondary.dark',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        ID: {trade.id}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                        }}
                      >
                        {TradeStatuses[trade.status || 0]}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ wordBreak: 'break-all' }}
                        >
                          {`${trade.external_id.slice(0, 5)}...${trade.external_id.slice(-5)}`}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(trade.external_id)}
                        >
                          <Copy size={16} />
                        </IconButton>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                        }}
                      >
                        <b>PnL</b>
                        <span>
                          {formatCurrency(
                            trade.profit_in_usdt_processed || 0,
                            '',
                          )}
                          USDT
                        </span>
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </Typography>

                    <Divider />

                    <ItemRow
                      label="Amount From"
                      value={
                        trade.amount_from_processed
                          ? `${formatCurrency(trade.amount_from_processed, trade.liqudity_address_from?.currency?.iso)}`
                          : '-'
                      }
                    />

                    <ItemRow
                      label="Amount To"
                      value={
                        trade.amount_to_processed
                          ? `${formatCurrency(trade.amount_to_processed, trade.liqudity_address_to?.currency?.iso)}`
                          : '-'
                      }
                    />

                    <ItemRow
                      label="Rate"
                      value={formatCurrency(
                        trade.fixed_rate_in_second,
                        trade.liqudity_address_to?.currency?.iso,
                      )}
                    />

                    <ItemRow
                      label="Fee"
                      value={
                        trade.fee_in_to_currency
                          ? `${formatCurrency(trade.fee_in_to_currency, trade.liqudity_address_to?.currency?.iso)}`
                          : '-'
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.ceil(totalRecords / LIMIT)}
          page={queryParams.page + 1} // Convert 0-indexed to 1-indexed
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
        />
      </Box>
    </Box>
  );
}
