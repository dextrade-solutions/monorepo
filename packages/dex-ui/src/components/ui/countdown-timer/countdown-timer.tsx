import './index.scss';
import { Tooltip } from '@mui/material';
import classnames from 'classnames';
import { Duration } from 'luxon';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import TimerIcon from './timer-icon';

// Constants
const SECOND = 1000; // 1 second in milliseconds

// Return the formatted time of the countdown timer.
function getNewTimer(
  currentTime: number,
  timeStarted: number,
  timeBaseStart: number,
) {
  const timeAlreadyElapsed = currentTime - timeStarted;
  return timeBaseStart - timeAlreadyElapsed;
}

function decreaseTimerByOne(timer: number) {
  return Math.max(timer - SECOND, 0);
}

function timeBelowWarningTime(timer: number, warningTime: string) {
  const [warningTimeMinutes, warningTimeSeconds] = warningTime.split(':');
  return (
    timer <=
    (Number(warningTimeMinutes) * 60 + Number(warningTimeSeconds)) * SECOND
  );
}

function formatTime(milliseconds: number): string {
  const duration = Duration.fromMillis(milliseconds);
  const days = Math.floor(duration.as('days'));
  const hours = Math.floor(duration.as('hours') % 24);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return duration.toFormat('hh:mm:ss');
  }
  return duration.toFormat('mm:ss');
}

export default function CountdownTimer({
  timeStarted,
  timeOnly,
  timerBase,
  warningTime,
  labelKey,
  infoTooltipLabelKey,
}: {
  timeStarted: number;
  timeOnly?: boolean;
  timerBase: number;
  warningTime?: string;
  labelKey: string;
  infoTooltipLabelKey: string;
}) {
  const { t } = useTranslation();
  const intervalRef = useRef<NodeJS.Timeout>();
  const initialTimeStartedRef = useRef<number>();
  const previousTimerRef = useRef<string>();

  const timerStart = Number(timerBase);

  // States for timer and currentTime
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [timer, setTimer] = useState(() =>
    getNewTimer(currentTime, timeStarted, timerStart),
  );

  // Update timer and currentTime every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const newCurrentTime = Date.now();
      setCurrentTime(newCurrentTime); // Update current time
      setTimer(getNewTimer(newCurrentTime, timeStarted, timerStart)); // Calculate new timer
    }, SECOND);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeStarted, timerStart]);

  // Reset timer when timeStarted changes
  useEffect(() => {
    if (!initialTimeStartedRef.current) {
      initialTimeStartedRef.current = timeStarted || Date.now();
    }

    if (timeStarted !== initialTimeStartedRef.current) {
      initialTimeStartedRef.current = timeStarted;
      const newCurrentTime = Date.now();
      setCurrentTime(newCurrentTime);
      setTimer(getNewTimer(newCurrentTime, timeStarted, timerStart));
    }
  }, [timeStarted, timerStart]);

  const formattedTimer = formatTime(timer);

  // Track previous timer value for animation
  const isSliding = previousTimerRef.current !== formattedTimer;
  previousTimerRef.current = formattedTimer;

  const timeElement = (
    <div
      className={classnames('countdown-timer__time', {
        'countdown-timer__time--sliding': isSliding,
      })}
    >
      {formattedTimer}
    </div>
  );

  let content;
  if (timeOnly) {
    content = timeElement;
  } else if (labelKey) {
    content = (
      <div className="countdown-timer__label">
        {t(labelKey)} {timeElement}
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
        {content}
      </div>
      {!timeOnly && infoTooltipLabelKey ? (
        <Tooltip title={t(infoTooltipLabelKey)} placement="bottom">
          <div className="countdown-timer__info-icon">ⓘ</div>
        </Tooltip>
      ) : null}
    </div>
  );
}
