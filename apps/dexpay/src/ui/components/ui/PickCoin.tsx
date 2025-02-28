import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { UrlIcon } from 'dex-ui';
import { map, isEmpty } from 'lodash';
import { Search } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { useQuery } from '../../hooks/use-query';
import { Currency } from '../../services';
import { getCoinIconByIso } from '../../utils/common';

interface SelectCoinProps {
  value: string;
  onChange: (coin: string) => void;
  error?: boolean;
  disabled?: boolean;
  maxWidth?: number;
}

export default function PickCoin({
  value,
  onChange,
  maxWidth,
}: SelectCoinProps) {
  const coinsQuery = useQuery(Currency.coins);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectChange = (newValue: string) => {
    onChange(newValue);
  };
  const allCoins = useMemo(
    () => map(coinsQuery.data?.list.currentPageResult || [], 'iso'),
    [coinsQuery.data],
  );
  const filteredCoins = useMemo(() => {
    if (isEmpty(searchQuery)) {
      return allCoins;
    }
    return allCoins.filter((coin) =>
      coin.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, allCoins]);

  return (
    <Box sx={{ maxWidth: maxWidth || '100%', width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          pb: 1,
          mb: 2,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search coin"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
        />
      </Box>
      <List sx={{ maxHeight: 300, overflow: 'auto', padding: 0 }}>
        {filteredCoins.map((option) => (
          <ListItem
            key={option}
            button
            onClick={() => handleSelectChange(option)}
            disableGutters
            sx={{
              padding: 1,
              borderRadius: 1,
              bgcolor: value === option ? 'secondary.dark' : 'transparent',
              '&:hover': {
                bgcolor: 'secondary.dark',
              },
            }}
          >
            <ListItemAvatar>
              <UrlIcon
                name={option}
                sx={{ mr: 1 }}
                url={getCoinIconByIso(option)}
                alt={`${option} icon`}
              />
            </ListItemAvatar>
            <ListItemText primary={option} sx={{ color: 'text.tertiary' }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
