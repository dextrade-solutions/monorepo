import './index.scss';
import { Tooltip } from '@mui/material';
import classnames from 'classnames';
import { SECOND } from 'dex-helpers';
import { Duration } from 'luxon';
import React, { useState, useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import TimerIcon from './timer-icon';

// Return the mm:ss start time of the countdown timer.
// If time has elapsed between `timeStarted` the time current time,
// then that elapsed time will be subtracted from the timer before
// rendering
function getNewTimer(currentTime, timeStarted, timeBaseStart) {
  const timeAlreadyElapsed = currentTime - timeStarted;
  return timeBaseStart - timeAlreadyElapsed;
}

function decreaseTimerByOne(timer) {
  return Math.max(timer - SECOND, 0);
}

function timeBelowWarningTime(timer, warningTime) {
  const [warningTimeMinutes, warningTimeSeconds] = warningTime.split(':');
  return (
    timer <=
    (Number(warningTimeMinutes) * 60 + Number(warningTimeSeconds)) * SECOND
  );
}

export default function CountdownTimer({
  timeStarted,
  timeOnly,
  timerBase,
  warningTime,
  labelKey,
  infoTooltipLabelKey,
}: {
  /**
   * Unix timestamp that indicates the time at which this timer has started
   * running.
   */
  timeStarted: number;

  /**
   * Boolean indicating whether to display only the time (`true`) or to also
   * display a label (`false`), given by the `labelKey` parameter.
   */
  timeOnly?: boolean;

  /**
   * The duration of this timer in milliseconds.
   */
  timerBase: number;

  /**
   * The time at which this timer should turn red, indicating it has almost run
   * out of time. Given in the format `mm:ss`.
   */
  warningTime?: string;

  /**
   * The key of the label to display next to the timer, defined in
   * `app/_locales/`.
   */
  labelKey: string;

  /**
   * The key of the label to display in the tooltip when hovering over the info
   * icon, defined in `app/_locales/`.
   */
  infoTooltipLabelKey: string;
}) {
  const { t } = useTranslation();
  const intervalRef = useRef();
  const initialTimeStartedRef = useRef();

  const timerStart = Number(timerBase);

  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [timer, setTimer] = useState(() =>
    getNewTimer(currentTime, timeStarted, timerStart),
  );

  useEffect(() => {
    if (intervalRef.current === undefined) {
      intervalRef.current = setInterval(() => {
        setTimer(decreaseTimerByOne);
      }, SECOND);
    }

    return function cleanup() {
      clearInterval(intervalRef.current);
    };
  }, []);

  // Reset the timer that timer has hit '0:00' and the timeStarted prop has changed
  useEffect(() => {
    if (!initialTimeStartedRef.current) {
      initialTimeStartedRef.current = timeStarted || Date.now();
    }

    if (timer === 0 && timeStarted !== initialTimeStartedRef.current) {
      initialTimeStartedRef.current = timeStarted;
      const newCurrentTime = Date.now();
      setCurrentTime(newCurrentTime);
      setTimer(getNewTimer(newCurrentTime, timeStarted, timerStart));

      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimer(decreaseTimerByOne);
      }, SECOND);
    }
  }, [timeStarted, timer, timerStart]);

  const formattedTimer = Duration.fromMillis(timer).toFormat('m:ss');
  let time;
  if (timeOnly) {
    time = <div className="countdown-timer__time">{formattedTimer}</div>;
  } else if (labelKey) {
    time = (
      <div>
        {t(labelKey)}{' '}
        <div key="countdown-time-1" className="countdown-timer__time">
          {formattedTimer}
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-timer">
      <div
        data-testid="countdown-timer__timer-container"
        className={classnames('countdown-timer__timer-container', {
          'countdown-timer__timer-container--warning':
            warningTime && timeBelowWarningTime(timer, warningTime),
        })}
      >
        <TimerIcon />
        {time}
      </div>
      {!timeOnly && infoTooltipLabelKey ? (
        <Tooltip position="bottom" contentText={t(infoTooltipLabelKey)} />
      ) : null}
    </div>
  );
}
