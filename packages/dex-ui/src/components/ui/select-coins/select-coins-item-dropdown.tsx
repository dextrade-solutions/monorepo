import { Box, Typography } from '@mui/material';
import { ButtonIcon } from 'dex-ui';
import PropTypes from 'prop-types';
import React, { useMemo, useCallback, useState, useEffect } from 'react';

import { useCoinInputSearch } from './hooks/useCoinInputSearch';
import { SelectCoinsItemImportToken } from './select-coins-item-import-token';
import { SelectCoinsItemList } from './select-coins-item-list';
import { SelectCoinsItemSearch } from './select-coins-item-search';

const Placeholder = ({ loading, searchQuery }) => {
  const t = (v) => v;

  if (loading) {
    return (
      <div className="dropdown-search-list__loading-item">
        {/* <PulseLoader /> */}
        <div className="dropdown-search-list__loading-item-text-container">
          <span className="dropdown-search-list__loading-item-text">
            {t('swapFetchingTokens')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="dropdown-search-list__placeholder">
      {t('swapBuildQuotePlaceHolderText', [searchQuery])}
    </div>
  );
};

export const SelectCoinsItemDropdown = ({
  inputRef,
  coin,
  items,
  reversed,
  title,
  onChange,
  onClose,
  placeholder,
  hideItemIf,
  loading,
  placeholderInput,
  fuseSearchKeys = [
    { name: 'name', weight: 0.499 },
    { name: 'symbol', weight: 0.499 },
    { name: 'address', weight: 0.002 },
  ],
  shouldSearchForImports,
}) => {
  const t = (v) => v;
  const [searchQuery, setSearchQuery] = useState('');
  const [network, setNetwork] = useState(null);
  const [tokenForImport, setTokenForImport] = useState(null);
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState(false);
  let itemsFiltered = items.filter((i) => i !== coin);
  if (network) {
    itemsFiltered = itemsFiltered.filter((i) => i.network === network.key);
  }

  const [searchItems, handleSearchItems, handleSetFuse] = useCoinInputSearch({
    fuseSearchKeys,
  });
  // const handleSearchItems = () => {};
  // const handleSetFuse = () => {};

  const renderList = useMemo(() => {
    const list = searchQuery
      ? searchItems
      : itemsFiltered.slice(0, 6).map((i, idx) => ({ item: i, refIndex: idx }));

    return list.sort(
      (p, n) => Number(n.selected || false) - Number(p.selected || false),
    );
  }, [searchItems, itemsFiltered, searchQuery]);
  // const renderList = [];

  const handleClose = useCallback(() => {
    setSearchQuery('');
    onClose && onClose();
  }, [onClose]);

  const handleChange = useCallback(
    (c) => {
      setSearchQuery('');
      onChange && onChange(c);
      handleClose();
    },
    [onChange, handleClose],
  );

  const handleChangeSearchValue = useCallback(
    async (value) => {
      setSearchQuery(value.toUpperCase());
      await handleSearchItems(value);
    },
    [handleSearchItems],
  );

  useEffect(() => {
    handleSetFuse(itemsFiltered, searchQuery);
  }, [itemsFiltered]);

  const onImportToken = useCallback((token) => {
    setTokenForImport(token);
  }, []);

  const handleReset = useCallback(() => {
    setSearchQuery('');
    handleChange(null);
  }, [handleChange]);

  return (
    <div className="select-coins__item__dropdown__inner">
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingLeft={2}
        paddingRight={1}
        marginY={1}
      >
        <Typography fontWeight="bolder">{title}</Typography>
        <ButtonIcon
          iconName="close"
          size="sm"
          onClick={handleClose}
          ariaLabel={t('close')}
        />
      </Box>
      <SelectCoinsItemImportToken
        isImportTokenModalOpen={isImportTokenModalOpen}
        tokenForImport={tokenForImport}
        setTokenForImport={setTokenForImport}
        searchQuery={searchQuery}
        onSelect={handleChange}
        setIsImportTokenModalOpen={setIsImportTokenModalOpen}
        onClose={handleClose}
      />
      <SelectCoinsItemSearch
        network={network}
        inputRef={inputRef}
        value={searchQuery}
        onChange={handleChangeSearchValue}
        onChangeNetwork={(v) => {
          setNetwork(v);
        }}
        placeholder={placeholderInput}
      />
      <SelectCoinsItemList
        coin={coin}
        list={renderList}
        searchQuery={searchQuery}
        showRateLabel={reversed}
        onChange={handleChange}
        onImportToken={onImportToken}
        onClose={handleClose}
        onReset={handleReset}
        placeholder={
          placeholder || (
            <Placeholder
              loading={loading}
              searchQuery={searchQuery}
              shouldSearchForImports={shouldSearchForImports}
            />
          )
        }
        hideItemIf={hideItemIf}
      />
    </div>
  );
};

Placeholder.propTypes = {
  loading: PropTypes.bool,
  searchQuery: PropTypes.string,
  shouldSearchForImports: PropTypes.bool,
};

SelectCoinsItemDropdown.propTypes = {
  inputRef: PropTypes.any,
  maxListItem: PropTypes.number.isRequired,
  coin: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  reversed: PropTypes.bool,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  hideItemIf: PropTypes.func,
  fuseSearchKeys: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      weight: PropTypes.number.isRequired,
    }),
  ),
  loading: PropTypes.bool,
  placeholder: PropTypes.node,
  placeholderInput: PropTypes.string,
  shouldSearchForImports: PropTypes.bool,
};
