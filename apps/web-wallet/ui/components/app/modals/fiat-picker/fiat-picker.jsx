import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { InputAdornment } from '@material-ui/core';
import Fuse from 'fuse.js';

import { useI18nContext } from '../../../../hooks/useI18nContext';
import Popover from '../../../ui/popover';
import Box from '../../../ui/box/box';
import ItemList from '../../../../pages/swaps/searchable-item-list/item-list/item-list.component';
import TextField from '../../../ui/text-field';
import SearchIcon from '../../../ui/icon/search-icon';
import { useTokensToSearch } from '../../../../hooks/useTokensToSearch';
import { getFiatList } from '../../../../selectors';

export default function FiatPicker({ value = null, onSelect, onClose }) {
  const t = useI18nContext();
  const fiats = useSelector(getFiatList);

  const [searchQuery, setSearchQuery] = useState('');

  const itemList = useTokensToSearch({
    shuffledTokensList: fiats,
    renderableOutputFormat: false,
  });
  const [results, setResults] = useState(itemList);

  const searchFuse = new Fuse(itemList, {
    shouldSort: true,
    threshold: 0.45,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      { name: 'primaryLabel', weight: 0.5 },
      { name: 'symbol', weight: 0.5 },
    ],
  });

  const handleSearch = (v) => {
    const fuseSearchResult = searchFuse.search(v);
    setSearchQuery(v);
    if (v) {
      setResults(fuseSearchResult);
    } else {
      setResults(itemList);
    }
  };

  const renderAdornment = () => {
    return (
      <InputAdornment position="start" style={{ marginRight: '12px' }}>
        <SearchIcon color="var(--color-icon-muted)" />
      </InputAdornment>
    );
  };

  return (
    <Popover className="fiat-picker" title="Select fiat" onClose={onClose}>
      <Box paddingLeft={3} paddingRight={3} paddingBottom={4}>
        <TextField
          placeholder={t('searchFiat')}
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          fullWidth
          autoFocus
          autoComplete="off"
          startAdornment={renderAdornment()}
        />
        <Box marginTop={4}>
          <ItemList
            results={results}
            onClickItem={async (token) => {
              onSelect(token);
              onClose();
            }}
          />
        </Box>
      </Box>
    </Popover>
  );
}

FiatPicker.propTypes = {
  value: PropTypes.string,
  onSelect: PropTypes.func,
  onClose: PropTypes.func,
};
