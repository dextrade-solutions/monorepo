import { AssetModel } from 'dex-helpers/types';
import Fuse from 'fuse.js';
import { useEffect, useCallback, useRef, useState } from 'react';

interface AssetWithWeight extends AssetModel {
  weight?: number;
}

const DEFAULT_SEARCH_KEYS = [
  { name: 'symbol', weight: 0.8 },
  { name: 'name', weight: 0.1 },
  { name: 'contract', weight: 0.1 },
];

export function useAssetsSearch({
  assetsList = [],
  searchKeys = DEFAULT_SEARCH_KEYS,
}: {
  assetsList: AssetWithWeight[];
  searchKeys?: typeof DEFAULT_SEARCH_KEYS;
}) {
  const fuseRef = useRef<Fuse<AssetWithWeight> | null>(null);
  const [searchResults, setSearchResults] = useState<AssetWithWeight[]>([]);
  const [initial, setInitial] = useState<AssetWithWeight[]>([]);

  const initializeFuse = useCallback(() => {
    fuseRef.current = new Fuse(assetsList, {
      keys: searchKeys,
      threshold: 0.1,
      distance: 50,
      minMatchCharLength: 1,
      includeScore: true,
      shouldSort: true,
      findAllMatches: false,
      location: 0,
      ignoreLocation: false,
      useExtendedSearch: true,
      sortFn: (a, b) => {
        // First sort by Fuse score
        const scoreDiff = (a.score || 0) - (b.score || 0);
        if (Math.abs(scoreDiff) > 0.1) {
          return scoreDiff;
        }

        // If scores are close, sort by item weight
        const aWeight = assetsList[a.idx].weight || 0;
        const bWeight = assetsList[b.idx].weight || 0;
        return bWeight - aWeight;
      },
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
