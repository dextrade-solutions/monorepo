import Fuse from 'fuse.js';
import { useRef, useCallback, useState, useMemo } from 'react';

const DEFAULT_SEARCH_KEYS = [
  { name: 'name', weight: 0.499 },
  { name: 'symbol', weight: 0.499 },
  { name: 'address', weight: 0.002 },
];

export const useCoinInputSearch = (params) => {
  const { fuseSearchKeys = DEFAULT_SEARCH_KEYS } = params;
  const prevList = useRef([]);
  const fuseRef = useRef();
  const [result, setResult] = useState([]);

  const handleSearch = useCallback(async (value = '') => {
    // useCallback here
    const searchQuery = value.trim();
    if (!fuseRef.current) {
      setResult([]); // Or handle appropriately if fuse isn't initialized
      return [];
    }
    const fuseSearchResult = fuseRef.current.search(searchQuery, {
      limit: 6,
    });
    const search = fuseSearchResult;
    setResult(search);
    return search;
  }, []); // No dependencies needed since fuseRef.current is mutable

  const handleSetFuse = useCallback(
    (list, searchQuery) => {
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
      handleSearch(searchQuery);
    },
    [fuseSearchKeys, handleSearch],
  ); // Add handleSearch to dependencies

  return [result, handleSearch, handleSetFuse];
};
