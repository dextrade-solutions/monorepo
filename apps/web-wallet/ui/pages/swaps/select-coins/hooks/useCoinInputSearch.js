import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import log from 'loglevel';
import { useRef, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MILLISECOND } from '../../../../../shared/constants/time';
import { isValidHexAddress } from '../../../../../shared/modules/hexstring-utils';
import { getCurrentChainId } from '../../../../selectors';
import { fetchToken } from '../../swaps.util';

export const useCoinInputSearch = (params) => {
  const { query, list, fuseSearchKeys, shouldSearchForImports } = params;
  const chainId = useSelector(getCurrentChainId);
  const prevList = useRef(list);
  const result = useRef();
  const fuseRef = useRef();

  const handleSearchImportToken = async (address) => {
    try {
      const token = await fetchToken(address, chainId);
      if (token) {
        token.primaryLabel = token.symbol;
        token.secondaryLabel = token.name;
        token.notImported = true;
        return [token];
      }
    } catch (err) {
      log.error('Token not found, show 0 results.', err);
      return null;
    }
  };

  const debouncedSearchImportToken = debounce(
    handleSearchImportToken,
    MILLISECOND * 500,
  );

  const handleSearch = useCallback(
    async (value = '') => {
      const searchQuery = (value || query).trim();
      const validHexAddress = isValidHexAddress(searchQuery);
      const fuseSearchResult = fuseRef.current.search(searchQuery);
      const search = searchQuery ? fuseSearchResult : prevList.current;
      if (shouldSearchForImports && !search.length && validHexAddress) {
        result.current = await debouncedSearchImportToken(searchQuery);
      } else {
        result.current = search;
      }
      result.current = search;
      return result.current;
    },
    [query, debouncedSearchImportToken, shouldSearchForImports],
  );

  const handleSetFuse = useCallback(() => {
    if (fuseRef.current) {
      prevList.current = list;
      fuseRef.current.setCollection(list);
    } else {
      fuseRef.current = new Fuse(list, {
        shouldSort: true,
        // threshold: 0.45,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: fuseSearchKeys,
      });
    }
  }, [fuseSearchKeys, list]);

  useEffect(() => {
    handleSetFuse();
  }, [handleSetFuse]);

  return [result.current || [], handleSearch];
};
