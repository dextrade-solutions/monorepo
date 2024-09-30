import React from 'react';
import PropTypes from 'prop-types';

import { Fab } from '@material-ui/core';
import { Color, TextColor } from '../../../helpers/constants/design-system';
import { Text } from '../text';
import { Icon } from '../icon';

export const FabButton = ({ iconName, count, label, ...props }) => {
  return (
    <div className="fab-with-label">
      <Fab className="no-shadow" color="primary" {...props}>
        {iconName ? (
          <Icon name={iconName} color={Color.primaryInverse}/>
        ) : (
          <Text
            className="fab-with-label__text"
            color={TextColor.primaryInverse}
          >
            {count}
          </Text>
        )}
        <Text
          className="fab-with-label__label"
          color={TextColor.primaryDefault}
        >
          {label}
        </Text>
      </Fab>
    </div>
  );
};

FabButton.propTypes = {
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  iconName: PropTypes.string,
  label: PropTypes.string,
  ...Fab.propTypes,
};
