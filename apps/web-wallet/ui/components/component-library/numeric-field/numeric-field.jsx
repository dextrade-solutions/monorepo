import React from 'react';
import PropTypes from 'prop-types';
import Box from '../../ui/box/box';
import NumericInput from '../../ui/numeric-input';
import {
  AlignItems,
  Color,
  DISPLAY,
  FLEX_DIRECTION,
  Size,
  TEXT_ALIGN,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import IconButton from '../../ui/icon-button/icon-button';
import { ICON_NAMES, Icon } from '../icon';
import UnitInput from '../../ui/unit-input';
import { Text } from '../text';

export function NumericField({ value, label, endAccessory, onChange }) {
  const STEP = 0.5;

  const updateValue = (step) => {
    onChange(((Number(value) || 0) + step).toFixed(1));
  };

  return (
    <Box
      className="numeric-field"
      display={DISPLAY.FLEX}
      flexDirection={FLEX_DIRECTION.COLUMN}
    >
      <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
        <div className="flex-grow" />
        <IconButton
          label=""
          onClick={() => updateValue(-STEP)}
          Icon={<Icon color={Color.primaryInverse} name={ICON_NAMES.MINUS} />}
        />
        <Box className="flex-shrink">
          <Text
            variant={TextVariant.bodyXs}
            color={TextColor.textMuted}
            textAlign={TEXT_ALIGN.CENTER}
          >
            {label}
          </Text>
          <UnitInput
            suffix="%"
            value={value}
            placeholder="0.0"
            autoFocus={false}
            onChange={onChange}
          />
        </Box>
        {/* <NumericInput placeholder="0" value={value} onChange={onChange} />
        {endAccessory} */}
        <IconButton
          label=""
          onClick={() => updateValue(STEP)}
          Icon={<Icon color={Color.primaryInverse} name={ICON_NAMES.ADD} />}
        />
        <div className="flex-grow" />
      </Box>
    </Box>
  );
}

NumericField.propTypes = {
  value: PropTypes.number,
  label: PropTypes.node,
  onChange: PropTypes.func,
  endAccessory: PropTypes.node,
};
