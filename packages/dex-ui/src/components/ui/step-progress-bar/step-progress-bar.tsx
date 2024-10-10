import './index.scss';

import { Typography } from '@mui/material';
import classnames from 'classnames';
import type { P2P_STAGES } from 'dex-helpers';
import { Trade } from 'dex-helpers/types';
import React from 'react';

interface IProps {
  value: { trade: Trade; swapClaimed: boolean };
  stages: typeof P2P_STAGES;
}

export const StepProgressBar = ({ value, stages = [] }: IProps) => {
  const activeStages = stages.filter(({ checkStatus }) =>
    checkStatus(value.trade, value.swapClaimed),
  );
  return (
    <ul className="progressbar">
      {stages.map((stage, idx) => (
        <li
          key={idx}
          className={classnames({
            active: activeStages.includes(stage),
            complete: activeStages
              .slice(0, activeStages.length - 1)
              .includes(stage),
          })}
        >
          <Typography variant="caption" textTransform="capitalize">
            {stage.label}
          </Typography>
        </li>
      ))}
    </ul>
  );
};
