import { Box } from '@mui/material';
import { exchangerService } from 'dex-services';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PairGroupCard } from '../components/app/pair-group-card/pair-group-card';

interface PairGroup {
  fromTicker: string;
  toTicker: string;
  total: number;
  officialMerchantCount: number;
  minTradeAmount: number;
  maxTradeAmount: number;
  maxReserve: number;
}

export default function PairGroups() {
  const [pairGroups, setPairGroups] = useState<PairGroup[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPairGroups = async () => {
      try {
        const response = await exchangerService.getExchangerFilterGroup();
        setPairGroups(
          response.data.map((group) => ({
            fromTicker: group.fromTicker || '',
            toTicker: group.toTicker || '',
            total: group.total || 0,
            officialMerchantCount: group.officialMerchantCount || 0,
            minTradeAmount: group.minTradeAmount || 0,
            maxTradeAmount: group.maxTradeAmount || 0,
            maxReserve: group.maxReserve || 0,
          })),
        );
      } catch (error) {
        console.error('Error fetching pair groups:', error);
      }
    };

    fetchPairGroups();
  }, []);

  const handlePairClick = (fromTicker: string, toTicker: string) => {
    navigate(`/?fromToken=${fromTicker}&toToken=${toTicker}`);
  };

  return (
    <Box>
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
        gap={2}
      >
        {pairGroups.map((group) => (
          <PairGroupCard
            key={`${group.fromTicker}-${group.toTicker}`}
            group={group}
            onClick={() => handlePairClick(group.fromTicker, group.toTicker)}
          />
        ))}
      </Box>
    </Box>
  );
}
