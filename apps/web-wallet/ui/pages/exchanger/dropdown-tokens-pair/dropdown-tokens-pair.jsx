import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  ICON_NAMES,
  ICON_SIZES,
  Icon,
} from '../../../components/component-library';
import Box from '../../../components/ui/box';
import {
  BLOCK_SIZES,
  DISPLAY,
  JustifyContent,
} from '../../../helpers/constants/design-system';
import IconButton from '../../../components/ui/icon-button';
import Tooltip from '../../../components/ui/tooltip';
import DropdownTokens from './dropdown-tokens';

export default function DropdownTokensPair({
  selectedItemFrom,
  selectedItemTo,
  itemsToSearchFrom,
  itemsToSearchTo,
  searchPlaceholderTextFrom,
  searchPlaceholderTextTo,
  fuseSearchKeys,
  onChange,
  disableFlip,
}) {
  const flip = () => {
    if (!disableFlip) {
      onChange({ toAsset: selectedItemFrom, fromAsset: selectedItemTo });
    }
  };

  const updateValue = (field, v) => {
    onChange({
      fromAsset: selectedItemFrom,
      toAsset: selectedItemTo,
      [field]: v,
    });
  };

  return (
    <div className="dropdown-tokens-pair">
      <DropdownTokens
        className={classnames('dropdown-tokens-pair--left')}
        selectedItem={selectedItemTo}
        itemsToSearch={itemsToSearchTo}
        fuseSearchKeys={fuseSearchKeys}
        onSelect={(v) => updateValue('toAsset', v)}
        searchPlaceholderText={searchPlaceholderTextTo}
      />
      <Box
        className="dropdown-tokens-pair__divider"
        width={BLOCK_SIZES.FULL}
        display={DISPLAY.FLEX}
        justifyContent={JustifyContent.center}
      >
        <IconButton
          className="dropdown-tokens-pair__swap-icon"
          onClick={() => flip()}
          tooltipRender={(contents) => (
            <Tooltip title="Flip coins" position="bottom">
              {contents}
            </Tooltip>
          )}
          Icon={<Icon size={ICON_SIZES.LG} name={ICON_NAMES.ARROW_RIGHT_DEX} />}
          disabled={disableFlip}
        ></IconButton>
      </Box>
      <DropdownTokens
        className="dropdown-tokens-pair--right"
        selectedItem={selectedItemFrom}
        itemsToSearch={itemsToSearchFrom}
        fuseSearchKeys={fuseSearchKeys}
        onSelect={(v) => updateValue('fromAsset', v)}
        hideRightLabels
        searchPlaceholderText={searchPlaceholderTextFrom}
      />
    </div>
  );
}

DropdownTokensPair.propTypes = {
  selectedItemFrom: PropTypes.object,
  selectedItemTo: PropTypes.object,
  itemsToSearchFrom: PropTypes.array,
  itemsToSearchTo: PropTypes.array,
  fuseSearchKeys: PropTypes.array,
  onChange: PropTypes.func,
  disableFlip: PropTypes.bool,
  searchPlaceholderTextFrom: PropTypes.string,
  searchPlaceholderTextTo: PropTypes.string,
};
