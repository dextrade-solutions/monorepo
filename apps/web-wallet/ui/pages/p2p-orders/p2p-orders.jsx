import React from 'react';
import { useHistory } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { Tab, Tabs } from '../../components/ui/tabs';
import PageContainer from '../../components/ui/page-container';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
import { useI18nContext } from '../../hooks/useI18nContext';
import P2PHistory from './components/p2p-history';

export function P2POrders() {
  const t = useI18nContext();
  const history = useHistory();

  const mostRecentOverviewPage = useSelector(getMostRecentOverviewPage);

  const renderTabs = () => {
    const tabs = [];
    tabs.push(
      <Tab name="All" tabKey="search">
        <P2PHistory />
      </Tab>,
    );
    tabs.push(
      <Tab name="Unpaid" tabKey="search">
        <P2PHistory unpaid />
      </Tab>,
    );
    tabs.push(
      <Tab name="Processing" tabKey="search">
        <P2PHistory pending />
      </Tab>,
    );

    return <Tabs>{tabs}</Tabs>;
  };

  return (
    <PageContainer
      title="P2P Transactions"
      tabsComponent={renderTabs()}
      hideCancel
      hideFooter
      onClose={() => {
        history.push(mostRecentOverviewPage);
      }}
    />
  );
}
