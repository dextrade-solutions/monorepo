import { AssetModel } from 'dex-helpers/types';
import Fuse, { FuseSearchOptions } from 'fuse.js';
import { useEffect, useCallback, useRef, useState } from 'react';

const DEFAULT_SEARCH_KEYS = [
  { name: 'name', weight: 0.499 },
  { name: 'symbol', weight: 0.499 },
  { name: 'address', weight: 0.002 },
];

export function useAssetsSearch({
  assetsList = [],
  searchKeys = DEFAULT_SEARCH_KEYS,
}: {
  assetsList: AssetModel[];
  searchKeys?: FuseSearchOptions[];
}) {
  const fuseRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [initial, setInitial] = useState([]);

  const initializeFuse = useCallback(() => {
    fuseRef.current = new Fuse(assetsList, {
      keys: searchKeys,
      // ... other fuse options like location, distance, etc.
      // Example:
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
    });
    const initialList = assetsList.slice(0, 6);
    setInitial(initialList);
  }, [searchKeys, assetsList]);

  useEffect(() => {
    initializeFuse();
  }, [initializeFuse]);

  const handleSearch = useCallback(
    (searchQuery = '') => {
      if (!fuseRef.current) {
        // Handle the case where fuse is not yet initialized
        // Perhaps by returning an empty array or showing a loading indicator
        setSearchResults([]);
        return;
      }
      if (searchQuery) {
        const results = fuseRef.current.search(searchQuery, { limit: 10 });
        setSearchResults(results.map((result) => result.item));
      } else {
        setSearchResults(initial);
      }
    },
    [initial],
  );

  return [searchResults, handleSearch];
}
