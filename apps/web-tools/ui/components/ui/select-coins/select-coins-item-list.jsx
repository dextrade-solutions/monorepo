import { Box, Button, Collapse, Typography } from '@mui/material';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';

import { getCoinIconByUid } from '../../../helpers/utils/tokens';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getUseCurrencyRateCheck } from '../../../selectors';
import UrlIcon from '../url-icon';

export const SelectCoinsItemList = ({
  list,
  coin,
  hideItemIf,
  showRateLabel,
  onChange,
  onImportToken,
  placeholder: Placeholder,
  onClose,
  onReset,
  searchQuery,
}) => {
  const t = useI18nContext();
  const useCurrencyRateCheck = useSelector(getUseCurrencyRateCheck);

  const handleReset = useCallback(
    (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      onReset && onReset();
    },
    [onReset],
  );

  if (!list.length) {
    return (
      <Box ml={2} my={3}>
        {Placeholder || <div>empty list</div>}
      </Box>
    );
  }

  return (
    <>
      <ul className="select-coins__list">
        {Boolean(coin) && (
          <li
            className="select-coins__list__item__clear"
            key="select-coin-item-reset"
          >
            <Button type="inline" onClick={handleReset}>
              {t('reset')}
            </Button>
          </li>
        )}
        <TransitionGroup>
          {list.map(({ item, refIndex }) => {
            if (hideItemIf?.(item)) {
              return null;
            }

            const {
              selected,
              disabled,
              iconUrl,
              name,
              standard,
              uid,
              IconComponent,
              notImported,
            } = item;

            const handleClick = (e) => {
              e && e.preventDefault();
              e && e.stopPropagation();
              e && e.nativeEvent?.stopImmediatePropagation();
              if (notImported) {
                onImportToken(item);
              } else {
                onChange?.(selected ? null : item);
              }
            };

            const handleKeyUp = (e) => {
              if (e.key === 'Escape') {
                onClose && onClose();
              }
              if (e.key === 'Enter') {
                handleClick(e);
              }
            };

            return (
              <Collapse key={refIndex}>
                <li
                  className={classnames('select-coins__list__item', {
                    'select-coins__list__item--selected': selected,
                    'select-coins__list__item--disabled': !selected && disabled,
                  })}
                  tabIndex={0}
                  onClick={handleClick}
                  onKeyUp={handleKeyUp.bind(item)}
                >
                  {uid && <UrlIcon url={getCoinIconByUid(uid)} name={name} />}
                  {IconComponent && <IconComponent />}
                  <div className="select-coins__list__item__label">
                    <div className="select-coins__list__item__label__block">
                      {name && (
                        <span className="searchable-item-list__primary-label">
                          {name}
                        </span>
                      )}
                      {standard && (
                        <Typography color="text.secondary">
                          {standard}
                        </Typography>
                      )}
                    </div>
                    {/* {showRateLabel &&
                  (rightname || rightstandard) && (
                    <div className="select-coins__list__item__label__block select-coins__list__item__label__block--rate">
                      {rightname && (
                        <span className="searchable-item-list__right-primary-label">
                          {rightname}
                        </span>
                      )}
                      {rightstandard && useCurrencyRateCheck && (
                        <span className="searchable-item-list__right-secondary-label">
                          {rightstandard}
                        </span>
                      )}
                    </div>
                  )} */}
                  </div>
                  {notImported && (
                    <Button
                      type="secondary"
                      onClick={handleClick}
                      className="select-coins__list__item__import"
                    >
                      {t('import')}
                    </Button>
                  )}
                </li>
              </Collapse>
            );
          })}
        </TransitionGroup>
      </ul>
    </>
  );
};

SelectCoinsItemList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.object).isRequired,
  searchQuery: PropTypes.string,
  coin: PropTypes.object,
  hideItemIf: PropTypes.func,
  showRateLabel: PropTypes.bool,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  onReset: PropTypes.func,
  onImportToken: PropTypes.func,
  placeholder: PropTypes.node,
};
