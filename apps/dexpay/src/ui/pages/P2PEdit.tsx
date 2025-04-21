import React from 'react';
import { useHashLocation } from 'wouter/use-hash-location';

import EditAdvertForm from '../components/p2p/EditAdvertForm';
import { ROUTE_P2P } from '../constants/pages';

const P2PEdit = () => {
  const [_, navigate] = useHashLocation();

  return (
    <EditAdvertForm
      onSuccess={() => navigate(ROUTE_P2P)}
      advertId={Number(location.hash.split('/')[2])}
    />
  );
};

export default P2PEdit;
