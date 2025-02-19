import { Box, Typography } from '@mui/material';
import { AssetModel } from 'dex-helpers/types';
import { ButtonIcon } from 'dex-ui';
import React, { useMemo, useCallback, useState, useEffect } from 'react';

import { useAssetsSearch } from './hooks/useAssetsSearch';
import { SelectCoinsItemImportToken } from './select-coins-item-import-token';
import { SelectCoinsItemList } from './select-coins-item-list';
import { SelectCoinsItemSearch } from './select-coins-item-search';

interface PlaceholderProps {
  loading: boolean;
  searchQuery: string;
  shouldSearchForImports?: boolean;
}


const Placeholder = ({ loading, searchQuery }: PlaceholderProps) => {
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
      {t('Assets not found...', [searchQuery])}
    </div>
  );
};

interface SelectCoinsItemDropdownProps {
  inputRef?: React.RefObject<HTMLInputElement>;
  value?: AssetModel;
  items: AssetModel[];
  reversed?: boolean;
  title: string;
  onChange?: (c: AssetModel | null) => void;
  onClose: () => void;
  placeholder?: React.ReactNode;
  hideItemIf?: (item: AssetModel) => boolean;
  loading?: boolean;
  placeholderInput?: string;
  shouldSearchForImports?: boolean;
  maxListItem: number;
}

export const SelectCoinsItemDropdown = ({
  inputRef,
  value,
  items,
  reversed,
  title,
  onChange,
  onClose,
  placeholder,
  hideItemIf,
  loading,
  placeholderInput,
  shouldSearchForImports,
}: SelectCoinsItemDropdownProps) => {
  const t = (v) => v;
  const [searchQuery, setSearchQuery] = useState('');
  const [network, setNetwork] = useState(null);
  const [tokenForImport, setTokenForImport] = useState(null);
  const [isImportTokenModalOpen, setIsImportTokenModalOpen] = useState(false);

  const itemsFiltered = useMemo(() => {
    let result = items;
    if (value) {
      result = result.filter((i) => i.iso !== value.iso);
    }
    if (network) {
      result = result.filter((i) => i.network === network.key);
    }
    return result;
  }, [items, value, network]);

  const [searchItems, handleSearchItems] = useAssetsSearch({
    assetsList: itemsFiltered,
  });

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
    handleChangeSearchValue('');
  }, [handleChangeSearchValue]);

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
        coin={value}
        list={searchItems}
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
