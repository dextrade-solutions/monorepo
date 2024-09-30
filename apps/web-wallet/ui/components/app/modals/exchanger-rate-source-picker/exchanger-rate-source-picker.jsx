import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '../../../ui/list-item';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { RATE_SOURCES_META } from '../../../../../shared/constants/exchanger';
import { ICON_NAMES, Icon } from '../../../component-library';
import Popover from '../../../ui/popover';

export default function ExchangerRateSourcePicker({
  value,
  availableAggregators,
  onSelect,
  onClose,
}) {
  const t = useI18nContext();
  return (
    <Popover title={t('exchangerRatePicker')} onClose={onClose}>
      {availableAggregators.map((item) => (
        <ListItem
          key={item.currencyAggregator}
          icon={<Icon name={RATE_SOURCES_META[item.currencyAggregator].icon} />}
          title={RATE_SOURCES_META[item.currencyAggregator].title}
          subtitle={item.price}
          onClick={() => {
            onSelect(item);
            onClose();
          }}
          rightContent={
            value === item.currencyAggregator && (
              <Icon name={ICON_NAMES.CHECK} />
            )
          }
        />
      ))}
    </Popover>
  );
}

ExchangerRateSourcePicker.propTypes = {
  value: PropTypes.string,
  availableAggregators: PropTypes.array,
  onSelect: PropTypes.func,
  onClose: PropTypes.func,
};
