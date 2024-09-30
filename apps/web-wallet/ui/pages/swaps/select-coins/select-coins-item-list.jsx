import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import Button from '../../../components/ui/button';
import Identicon from '../../../components/ui/identicon/identicon.container';
import UrlIcon from '../../../components/ui/url-icon';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getUseCurrencyRateCheck } from '../../../selectors';

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
      <div className="select-coins__list__placeholder">
        {Placeholder || <div>empty list</div>}
      </div>
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
        {list.map((item, idx) => {
          if (hideItemIf?.(item)) {
            return null;
          }

          const {
            selected,
            disabled,
            iconUrl,
            primaryLabel,
            secondaryLabel,
            identiconAddress,
            IconComponent,
            rightPrimaryLabel,
            rightSecondaryLabel,
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
            <li
              className={classnames('select-coins__list__item', {
                'select-coins__list__item--selected': selected,
                'select-coins__list__item--disabled': !selected && disabled,
              })}
              tabIndex={0}
              onClick={handleClick}
              onKeyUp={handleKeyUp.bind(item)}
              key={`select-coin-item-${primaryLabel}-${idx}`}
            >
              {(iconUrl || primaryLabel) && (
                <UrlIcon url={iconUrl} name={primaryLabel} />
              )}
              {!(iconUrl || primaryLabel) && identiconAddress && (
                <div className="searchable-item-list__identicon">
                  <Identicon address={identiconAddress} diameter={24} />
                </div>
              )}
              {IconComponent && <IconComponent />}
              <div className="select-coins__list__item__label">
                <div className="select-coins__list__item__label__block">
                  {primaryLabel && (
                    <span className="searchable-item-list__primary-label">
                      {primaryLabel}
                    </span>
                  )}
                  {secondaryLabel && (
                    <span className="searchable-item-list__secondary-label">
                      {secondaryLabel}
                    </span>
                  )}
                </div>
                {showRateLabel &&
                  (rightPrimaryLabel || rightSecondaryLabel) && (
                    <div className="select-coins__list__item__label__block select-coins__list__item__label__block--rate">
                      {rightPrimaryLabel && (
                        <span className="searchable-item-list__right-primary-label">
                          {rightPrimaryLabel}
                        </span>
                      )}
                      {rightSecondaryLabel && useCurrencyRateCheck && (
                        <span className="searchable-item-list__right-secondary-label">
                          {rightSecondaryLabel}
                        </span>
                      )}
                    </div>
                  )}
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
          );
        })}
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
