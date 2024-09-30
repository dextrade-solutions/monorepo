import React from 'react';
import PropTypes from 'prop-types';
import Box from '../box/box';
import { Text } from '../../component-library';
import {
  AlignItems,
  DISPLAY,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';

import UrlIcon from '../url-icon';
import { formatLongAmount } from '../../../../shared/lib/ui-utils';
import { getCoinIconByUid } from '../../../../shared/constants/tokens';

export default function Asset({ asset, amount, label, isCoin, ...args }) {
  return (
    <Box {...args} display={DISPLAY.FLEX} alignItems={AlignItems.center}>
      <UrlIcon
        url={isCoin ? getCoinIconByUid(asset.uuid) : asset.getIconUrl()}
        name={asset.symbol}
      />
      <Box marginLeft={3}>
        {label && (
          <Text variant={TextVariant.bodyXs} color={TextColor.textMuted}>
            {label}
          </Text>
        )}
        <Text variant={TextVariant.bodyLgMedium}>
          {amount ? formatLongAmount(amount) : ''}{' '}
          {isCoin ? asset.ticker : asset.symbol}
        </Text>
        {(asset.standard || asset.networkType) && (
          <Box className="network-type-label">
            {asset.standard ? asset.standard.toUpperCase() : asset.networkType}
          </Box>
        )}
      </Box>
    </Box>
  );
}

Asset.propTypes = {
  asset: PropTypes.object.isRequired,
  amount: PropTypes.number,
  label: PropTypes.string,
  isCoin: PropTypes.bool,
};
