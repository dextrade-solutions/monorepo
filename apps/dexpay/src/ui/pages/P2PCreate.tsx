import React from 'react';
import { useLocation } from 'wouter';

import CreateAdvertForm from '../components/p2p/CreateAdvertForm';
import { ROUTE_P2P } from '../constants/pages';

const P2PCreate = () => {
  const [_, navigate] = useLocation();
  return <CreateAdvertForm onSuccess={() => navigate(ROUTE_P2P)} />;
};

export default P2PCreate;
