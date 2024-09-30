import './index.scss';

import { Typography } from '@mui/material';
import classnames from 'classnames';
import React from 'react';

import { P2P_STAGES } from './stages';
import { Trade } from '../../../../app/types/p2p-swaps';

interface IProps {
  value: { trade: Trade; swapClaimed: boolean };
  stages: typeof P2P_STAGES;
}

export const StepProgressBar: React.FC<IProps> = ({ value, stages = [] }) => {
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
