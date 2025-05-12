import Fuse from 'fuse.js';
import { useRef, useCallback, useState } from 'react';

export const useCoinInputSearch = (params) => {
  const { fuseSearchKeys } = params;
  const prevList = useRef([]);
  const fuseRef = useRef();
  const [result, setResult] = useState([]);

  const handleSearch = async (value = '') => {
    const searchQuery = value.trim();
    const fuseSearchResult = fuseRef.current.search(searchQuery, {
      limit: 8,
    });
    const search = fuseSearchResult;
    setResult(search);
    return search;
  };

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
    [fuseSearchKeys],
  );

  return [result, handleSearch, handleSetFuse];
};
