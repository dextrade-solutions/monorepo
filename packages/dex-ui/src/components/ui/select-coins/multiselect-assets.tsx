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
import React, { useEffect, useMemo, useRef, useState } from 'react';

import UrlIcon from '../url-icon';
import { useAssetsSearch } from './hooks/useAssetsSearch';

export function MultiselectAssets({
  value = [],
  currencies,
  variant = 'standard',
  isLoading,
  onChange,
}: {
  value: AssetModel[];
  currencies: AssetModel[];
  variant: 'outlined' | 'standard';
  isLoading: boolean;
  onChange: (newVal: AssetModel[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container
  const inputRef = useRef<HTMLInputElement>(null); // Ref for input

  const filteredAssetList = useMemo(() => {
    const valueIso = value.map((i) => i.iso);

    return currencies.filter((i) => !valueIso.includes(i.iso));
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
  const onAdd = (i: AssetModel) => {
    onChange([...value, i]);
    if (inputRef.current) {
      inputRef.current.focus(); // Re-focus input after add
    }
  };

  const preloader = () => (
    <Box display="flex" flexWrap="wrap">
      {_.times(9).map((i) => (
        <Skeleton key={i} sx={{ m: 0.3 }} height={40} width={80} />
      ))}
    </Box>
  );

  // Handle clicks outside the component.
  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      containerRef.current.contains(event.target as Node) &&
      inputRef.current
    ) {
      inputRef.current.focus();
    }
  };

  return (
    <Paper
      ref={containerRef}
      elevation={0}
      sx={{
        p: 1,
        ...(variant === 'outlined'
          ? {
              border: 1,
              borderColor: 'tertiary.light',
            }
          : {}),
        marginY: 1,
      }}
      data-testid="multiselect-assets"
    >
      <FormControl fullWidth onClick={handleClickOutside}>
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
                      {i.standard.toLowerCase()}
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
          inputRef={inputRef}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          sx={{
            p: 1,
          }}
          disableUnderline
          placeholder="Type to search..."
          onChange={(e) => setSearch(e.target.value)}
        />
        {isLoading && preloader()}
        {!isLoading && (
          <Box
            display="flex"
            flexWrap="wrap"
            sx={{
              transition: 'opacity 0.3s ease-in-out',
              opacity: isInputFocused ? 1 : 0.5,
            }}
          >
            {searchItems.map((i) => (
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
                        {i.standard.toLowerCase()}
                      </Typography>
                    )}
                  </Box>
                }
                variant="outlined"
                icon={<UrlIcon url={getCoinIconByUid(i.uid)} />}
                onClick={() => onAdd(i)}
              />
            ))}
          </Box>
        )}
      </FormControl>
    </Paper>
  );
}
