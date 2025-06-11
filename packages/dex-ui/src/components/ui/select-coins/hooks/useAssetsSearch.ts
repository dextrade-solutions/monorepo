import { AssetModel } from 'dex-helpers/types';
import Fuse from 'fuse.js';
import { useEffect, useCallback, useRef, useState } from 'react';

const DEFAULT_SEARCH_KEYS = [
  { name: 'symbol', weight: 0.7 },
  { name: 'name', weight: 0.2 },
  { name: 'contract', weight: 0.1 },
];

export function useAssetsSearch({
  assetsList = [],
  searchKeys = DEFAULT_SEARCH_KEYS,
}: {
  assetsList: AssetModel[];
  searchKeys?: typeof DEFAULT_SEARCH_KEYS;
}) {
  const fuseRef = useRef<Fuse<AssetModel> | null>(null);
  const [searchResults, setSearchResults] = useState<AssetModel[]>([]);
  const [initial, setInitial] = useState<AssetModel[]>([]);

  const initializeFuse = useCallback(() => {
    fuseRef.current = new Fuse(assetsList, {
      keys: searchKeys,
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
    const initialList = assetsList.slice(0, 6);
    setInitial(initialList);
  }, [searchKeys, assetsList]);

  useEffect(() => {
    initializeFuse();
  }, [initializeFuse]);

  const handleSearch = useCallback(
    (searchQuery = '') => {
      if (!fuseRef.current) {
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
