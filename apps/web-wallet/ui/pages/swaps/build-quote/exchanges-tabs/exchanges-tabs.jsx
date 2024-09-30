import React, { memo, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tab, Tabs } from '../../../../components/ui/tabs';
import {
  getDefaultSwapsActiveTabName,
  getSwapsFeatureIsLive,
} from '../../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { setDefaultSwapsActiveTabName } from '../../../../store/actions';
import { EXCHANGER_TAB_NAME, tabs } from './constants';

const ExchangesTabs = (props) => {
  const t = useI18nContext();
  const dispatch = useDispatch();

  const swapsEnabled = useSelector(getSwapsFeatureIsLive);

  const defaultSwapsActiveTabName = useSelector(getDefaultSwapsActiveTabName);

  const defaultActiveTabKey = useMemo(
    () => defaultSwapsActiveTabName || tabs[0].name,
    [defaultSwapsActiveTabName],
  );

  const handleChange = useCallback(
    (name) => {
      if (defaultSwapsActiveTabName === name) {
        return;
      }
      dispatch(setDefaultSwapsActiveTabName(name));
    },
    [defaultSwapsActiveTabName, dispatch],
  );

  const checkDisabled = useCallback(
    ({ name }) => {
      switch (name) {
        case EXCHANGER_TAB_NAME.P2P:
          return !swapsEnabled;
        default:
          return false;
      }
    },
    [swapsEnabled],
  );

  return (
    <>
      <Tabs
        defaultActiveTabKey={defaultActiveTabKey}
        className="build-quote__exchange-type"
        onTabClick={handleChange}
      >
        {tabs.map((tab) => {
          const { name, component: Component, ...rest } = tab;
          return (
            <Tab
              key={name}
              name={t(name)}
              tabKey={name}
              className="flex-grow"
              disabled={checkDisabled(tab)}
              {...rest}
            >
              <Component {...props} />
            </Tab>
          );
        })}
      </Tabs>
    </>
  );
};

export default memo(ExchangesTabs);
