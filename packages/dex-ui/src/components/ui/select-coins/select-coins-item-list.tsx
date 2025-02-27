import { Box, Button, Chip, Collapse, Typography } from '@mui/material';
import classnames from 'classnames';
import {
  formatCurrency,
  formatFundsAmount,
  getCoinIconByUid,
} from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { Icon, UrlIcon } from 'dex-ui';
import React, { useCallback } from 'react';
import { TransitionGroup } from 'react-transition-group';

interface AssetModelWithExtra extends AssetModel {
  selected?: boolean;
  disabled?: boolean;
  balance?: string;
  balanceUsdt?: string;
  IconComponent?: React.ComponentType<any>; //  for custom icons
  notImported?: boolean;
}

interface SelectCoinsItemListProps {
  list: AssetModelWithExtra[];
  coin?: AssetModel;
  placeholder?: React.ReactNode;
  hideItemIf?: (item: AssetModelWithExtra) => boolean;
  onChange?: (coin: AssetModelWithExtra | null) => void;
  onImportToken?: (item: AssetModelWithExtra) => void;
  onClose?: () => void;
  onReset?: () => void;
}

export const SelectCoinsItemList = ({
  list,
  coin,
  hideItemIf,
  onChange,
  onImportToken,
  placeholder: Placeholder,
  onClose,
  onReset,
}: SelectCoinsItemListProps) => {
  const t = (v) => v;
  const handleReset = useCallback(
    (e) => {
      e && e.preventDefault();
      e && e.stopPropagation();
      onReset && onReset();
    },
    [onReset],
  );
  const renderSelected = () => (
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
              <Typography marginLeft={1} fontWeight="light">
                {coin.standard.toUpperCase()}
              </Typography>
            )}
            {typeof coin.balanceUsdt !== 'undefined' && (
              <Typography
                marginLeft={1}
                fontWeight="light"
                color="text.secondary"
              >
                {`(${formatCurrency(coin.balanceUsdt, 'usd')})`}
              </Typography>
            )}
            <Icon marginLeft={1} name="close" size="sm" />
          </Box>
        }
        onClick={handleReset}
      ></Chip>
    </Box>
  );
  if (!list.length) {
    return (
      <>
        {Boolean(coin) && renderSelected()}
        <Box ml={2} my={3}>
          {Placeholder || <div>empty list</div>}
        </Box>
      </>
    );
  }
  return (
    <>
      <ul className="select-coins__list">
        {Boolean(coin) && renderSelected()}
        <TransitionGroup>
          {list.map((item) => {
            if (hideItemIf?.(item)) {
              return null;
            }

            const {
              selected,
              disabled,
              name,
              standard,
              uid,
              symbol,
              balance,
              balanceUsdt,
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
              <Collapse key={item.iso}>
                <li
                  className={classnames('select-coins__list__item', {
                    'select-coins__list__item--selected': selected,
                    'select-coins__list__item--disabled': !selected && disabled,
                  })}
                  data-testid={item.iso}
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
                        <Typography fontWeight="light">
                          {standard.toUpperCase()}
                        </Typography>
                      )}
                    </div>
                    <Box textAlign="right">
                      {typeof balance !== 'undefined' && (
                        <Typography>{formatFundsAmount(balance)}</Typography>
                      )}
                      {typeof balanceUsdt !== 'undefined' && (
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(balanceUsdt, 'usd')}
                        </Typography>
                      )}
                    </Box>
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
