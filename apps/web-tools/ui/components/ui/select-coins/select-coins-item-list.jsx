import { Box, Button, Chip, Collapse, Typography } from '@mui/material';
import classnames from 'classnames';
import { getCoinIconByUid } from 'dex-helpers';
import { Icon, UrlIcon } from 'dex-ui';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { TransitionGroup } from 'react-transition-group';

import { useI18nContext } from '../../../hooks/useI18nContext';

export const SelectCoinsItemList = ({
  list,
  coin,
  hideItemIf,
  onChange,
  onImportToken,
  placeholder: Placeholder,
  onClose,
  onReset,
}) => {
  const t = useI18nContext();

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
          <Box
            as="li"
            marginLeft={2}
            marginY={1}
            className="select-coins__list__item__clear"
            key="select-coin-item-reset"
          >
            <Typography marginRight={2}>Selected: </Typography>
            <Chip
              type="inline"
              label={
                <Box display="flex" alignItems="center" alignContent="center">
                  {coin.uid && (
                    <Box marginRight={1}>
                      <UrlIcon
                        marginRight={2}
                        url={getCoinIconByUid(coin.uid)}
                        name={coin.name}
                      />
                    </Box>
                  )}
                  <Typography
                    fontWeight="bold"
                    className="searchable-item-list__primary-label"
                  >
                    {`${coin.symbol}`}
                  </Typography>
                  {coin.standard && (
                    <Typography
                      variant="caption"
                      marginLeft={1}
                      fontWeight="light"
                    >
                      {coin.standard.toUpperCase()}
                    </Typography>
                  )}
                  <Icon marginLeft={1} name="close" size="sm" />
                </Box>
              }
              onClick={handleReset}
            ></Chip>
          </Box>
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
              symbol,
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
                        <Typography
                          fontWeight="bold"
                          className="searchable-item-list__primary-label"
                        >
                          {`${symbol} (${name})`}
                        </Typography>
                      )}
                      {standard && (
                        <Typography variant="caption" fontWeight="light">
                          {standard.toUpperCase()}
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
