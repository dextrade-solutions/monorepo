import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { capitalize } from 'lodash';
import Box from '../../ui/box';

export function StepProgressBarNew({ value, stages = [], ...boxProps }) {
  const currentIndex = stages.findIndex(({ status }) => status.includes(value));
  return (
    <Box {...boxProps}>
      <ul className="progressbar">
        {stages.map((stage, idx) => (
          <li
            key={idx}
            className={classnames({
              active: currentIndex >= idx,
              complete:
                currentIndex > idx || currentIndex === stages.length - 1,
            })}
          >
            {capitalize(stage.label)}
          </li>
        ))}
      </ul>
    </Box>
  );
}

StepProgressBarNew.propTypes = {
  value: PropTypes.number,
  stages: PropTypes.array,
  ...Box.propTypes,
};
