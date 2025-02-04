import {
  FormControl,
  Input,
  Chip,
  Box,
  Paper,
  Typography,
  Skeleton,
} from '@mui/material';
import { getCoinIconByUid } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';

import UrlIcon from '../url-icon';
import { useAssetsSearch } from './hooks/useAssetsSearch';

export function MultiselectAssets({
  value = [],
  currencies,
  isLoading,
  onChange,
}: {
  value: AssetModel[];
  currencies: any[];
  isLoading: boolean;
  onChange: (newVal: AssetModel[]) => void;
}) {
  const [search, setSearch] = useState('');

  const filteredAssetList = useMemo(() => {
    const valueIso = value.map((i) => i.iso);
    const assetList = currencies.map((i) => ({
      ...i.asset,
      extra: {
        currency: i.currency,
      },
    }));
    return assetList.filter((i) => !valueIso.includes(i.iso));
  }, [value, currencies]);

  const [searchItems, handleSearch] = useAssetsSearch({
    assetsList: filteredAssetList as AssetModel[],
  });

  useEffect(() => {
    handleSearch(search);
  }, [value, search, handleSearch]);

  const onDelete = (i: AssetModel) => {
    onChange(value.filter((v) => v.iso !== i.iso));
    handleSearch(search);
  };

  const preloader = () => (
    <Box display="flex" flexWrap="wrap">
      {_.times(9).map((i) => (
        <Skeleton key={i} sx={{ m: 0.3 }} height={40} width={80} />
      ))}
    </Box>
  );
  return (
    <Paper
      sx={{
        p: 1,
        border: 1,
        borderColor: 'text.secondary',
        marginY: 1,
      }}
    >
      <FormControl fullWidth>
        <Box display="flex" flexWrap="wrap">
          {value.map((i) => (
            <Chip
              sx={{
                m: 0.5,
              }}
              margin="normal"
              key={i.iso}
              label={
                <Box display="flex">
                  <Typography>{i.symbol}</Typography>
                  {i.standard && (
                    <Typography ml={1} color="text.secondary">
                      {i.standard}
                    </Typography>
                  )}
                </Box>
              }
              icon={<UrlIcon url={getCoinIconByUid(i.uid)} />}
              onClick={() => onDelete(i)}
              onDelete={() => onDelete(i)}
            />
          ))}
        </Box>
        <Input
          sx={{
            p: 1,
          }}
          disableUnderline
          placeholder="Type to search..."
          onChange={(e) => setSearch(e.target.value)}
        />
        {isLoading && preloader()}
        {!isLoading && (
          <Box display="flex" flexWrap="wrap">
            {searchItems.map((i, idx) => (
              <Chip
                sx={{
                  m: 0.5,
                }}
                margin="normal"
                key={i.iso}
                label={
                  <Box display="flex">
                    <Typography>{i.symbol}</Typography>
                    {i.standard && (
                      <Typography ml={1} color="text.secondary">
                        {i.standard}
                      </Typography>
                    )}
                  </Box>
                }
                variant="outlined"
                icon={<UrlIcon url={getCoinIconByUid(i.uid)} />}
                onClick={() => onChange([...value, i])}
              />
            ))}
          </Box>
        )}
      </FormControl>
    </Paper>
  );
}
