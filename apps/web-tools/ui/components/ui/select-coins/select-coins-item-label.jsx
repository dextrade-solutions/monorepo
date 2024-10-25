import { Typography } from '@mui/material';
import classnames from 'classnames';
import { getCoinIconByUid } from 'dex-helpers';
import { Icon, UrlIcon } from 'dex-ui';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

const ICON_URL_DEFAULT = './images/coins/default.svg';

export const SelectCoinsItemLabel = ({
  coin,
  onClick,
  reversed,
  placeholder,
}) => {
  const url = coin?.uid ? getCoinIconByUid(coin.uid) : ICON_URL_DEFAULT;
  const name = coin?.symbol || '';
  const type = coin?.standard || '';

  const handleClick = useCallback(
    (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      onClick();
    },
    [onClick],
  );

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleClick(e);
      }
    },
    [handleClick],
  );

  return (
    <div
      onClick={handleClick}
      onKeyUp={handleKeyUp}
      className={classnames('select-coins__item__label', {
        'select-coins__item__label-reversed': reversed,
      })}
    >
      {coin && (
        <UrlIcon
          url={url}
          className="select-coins__item__label__icon"
          name={name}
        />
      )}
      {coin ? (
        <div className="select-coins__item__label__title">
          <div className="select-coins__item__label__title__symbol">{name}</div>
          <Typography
            color="text.secondary"
            className="select-coins__item__label__title__type"
          >
            {type.toUpperCase()}
          </Typography>
        </div>
      ) : (
        <div className="select-coins__item__label__title__placeholder">
          {placeholder}
        </div>
      )}
      <Icon size="sm" name="chevron-down" />
    </div>
  );
};

SelectCoinsItemLabel.propTypes = {
  coin: PropTypes.object,
  onClick: PropTypes.func.isRequired,
  reversed: PropTypes.bool,
  placeholder: PropTypes.string.isRequired,
};
