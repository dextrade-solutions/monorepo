import React from 'react';
import { useHashLocation } from 'wouter/use-hash-location';

import CreateAdvertForm from '../components/p2p/CreateAdvertForm';
import { ROUTE_P2P } from '../constants/pages';

const P2PCreate = () => {
  const [_, navigate] = useHashLocation();
  return <CreateAdvertForm onSuccess={() => navigate(ROUTE_P2P)} />;
};

export default P2PCreate;
