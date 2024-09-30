import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import log from 'loglevel';
import { useRef, useCallback, useEffect } from 'react';
import { MILLISECOND } from '../../../../../app/constants/time';


export const useCoinInputSearch = (params) => {
  const { list, fuseSearchKeys } = params;
  const prevList = useRef(list);
  const result = useRef();
  const fuseRef = useRef();

  const handleSearchImportToken = async (address) => {
    try {
      // const token = await fetchToken(address, chainId);
      const token = null;
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

  const handleSearch = useCallback(async (value = '') => {
    const searchQuery = value.trim();
    const fuseSearchResult = fuseRef.current.search(searchQuery, {
      limit: 6,
    });
    const search = fuseSearchResult;
    result.current = search;
    return result.current;
  }, []);

  const handleSetFuse = useCallback(() => {
    if (fuseRef.current) {
      prevList.current = list;
      fuseRef.current.setCollection(list);
    } else {
      fuseRef.current = new Fuse(list, {
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
