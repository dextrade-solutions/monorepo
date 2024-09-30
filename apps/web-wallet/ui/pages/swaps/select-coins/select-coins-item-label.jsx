import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback } from 'react';
import UrlIcon from '../../../components/ui/url-icon';

const ICON_URL_DEFAULT = './images/coins/default.svg';

export const SelectCoinsItemLabel = memo(
  ({ coin, onClick, reversed, placeholder }) => {
    const url = coin?.iconUrl || ICON_URL_DEFAULT;
    const name = coin?.symbol || '';
    const type = coin?.networkType || '';

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
        <UrlIcon
          url={url}
          className="select-coins__item__label__icon"
          name={name}
        />
        {coin ? (
          <div className="select-coins__item__label__title">
            <div className="select-coins__item__label__title__symbol">
              {name}
            </div>
            <div className="select-coins__item__label__title__type">
              {type.toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="select-coins__item__label__title__placeholder">
            {placeholder}
          </div>
        )}
      </div>
    );
  },
);

SelectCoinsItemLabel.propTypes = {
  coin: PropTypes.object,
  onClick: PropTypes.func.isRequired,
  reversed: PropTypes.bool,
  placeholder: PropTypes.bool.isRequired,
};
