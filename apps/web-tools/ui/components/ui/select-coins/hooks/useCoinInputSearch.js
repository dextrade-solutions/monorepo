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
          keys: fuseSearchKeys,
          threshold: 0.1, // Lower threshold means more strict matching
          distance: 50, // Reduce distance for more precise matching
          minMatchCharLength: 1,
          includeScore: true,
          shouldSort: true,
          findAllMatches: false,
          location: 0,
          ignoreLocation: false,
          useExtendedSearch: true,
        });
      }
      handleSearch(searchQuery);
    },
    [fuseSearchKeys],
  );

  return [result, handleSearch, handleSetFuse];
};
