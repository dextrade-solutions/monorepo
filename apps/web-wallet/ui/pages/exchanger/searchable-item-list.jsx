import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Identicon from '../../components/ui/identicon';
import UrlIcon from '../../components/ui/url-icon';
import Button from '../../components/ui/button';
import { I18nContext } from '../../contexts/i18n';

export default function ItemList({
  results = [],
  onClickItem,
  onOpenImportTokenModalClick,
  Placeholder,
  listTitle,
  maxListItems = 6,
  searchQuery = '',
  containerRef,
  hideRightLabels,
  hideItemIf,
  listContainerClassName,
}) {
  const t = useContext(I18nContext);

  const placeholder = Placeholder ? (
    <Placeholder searchQuery={searchQuery} />
  ) : null;
  return results.length === 0 ? (
    placeholder
  ) : (
    <div className="searchable-item-list">
      {listTitle ? (
        <div className="searchable-item-list__title">{listTitle}</div>
      ) : null}
      <div
        className={classnames(
          'searchable-item-list__list-container',
          listContainerClassName,
        )}
        ref={containerRef}
      >
        {results.slice(0, maxListItems).map((result, i) => {
          if (hideItemIf?.(result)) {
            return null;
          }

          const onClick = () => {
            if (result.notImported) {
              onOpenImportTokenModalClick(result);
            } else {
              onClickItem?.(result);
            }
          };
          const {
            iconUrl,
            identiconAddress,
            selected,
            disabled,
            primaryLabel,
            secondaryLabel,
            rightPrimaryLabel,
            rightSecondaryLabel,
            IconComponent,
          } = result;
          return (
            <div
              tabIndex="0"
              className={classnames('searchable-item-list__item', {
                'searchable-item-list__item--selected': selected,
                'searchable-item-list__item--disabled': disabled,
              })}
              data-testid="searchable-item-list__item"
              onClick={onClick}
              onKeyUp={(e) => e.key === 'Enter' && onClick()}
              key={`searchable-item-list-item-${i}`}
            >
              {iconUrl || primaryLabel ? (
                <UrlIcon url={iconUrl} name={primaryLabel} />
              ) : null}
              {!(iconUrl || primaryLabel) && identiconAddress ? (
                <div className="searchable-item-list__identicon">
                  <Identicon address={identiconAddress} diameter={24} />
                </div>
              ) : null}
              {IconComponent ? <IconComponent /> : null}
              <div className="searchable-item-list__labels">
                <div className="searchable-item-list__item-labels">
                  {primaryLabel ? (
                    <span className="searchable-item-list__primary-label">
                      {primaryLabel}
                    </span>
                  ) : null}
                  {secondaryLabel ? (
                    <span className="searchable-item-list__secondary-label">
                      {secondaryLabel}
                    </span>
                  ) : null}
                </div>
                {!hideRightLabels &&
                (rightPrimaryLabel || rightSecondaryLabel) ? (
                  <div className="searchable-item-list__right-labels">
                    {rightPrimaryLabel ? (
                      <span className="searchable-item-list__right-primary-label">
                        {rightPrimaryLabel}
                      </span>
                    ) : null}
                    {rightSecondaryLabel ? (
                      <span className="searchable-item-list__right-secondary-label">
                        {rightSecondaryLabel}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {result.notImported && (
                <Button type="primary" onClick={onClick}>
                  {t('import')}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

ItemList.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      iconUrl: PropTypes.string,
      selected: PropTypes.bool,
      disabled: PropTypes.bool,
      primaryLabel: PropTypes.string,
      secondaryLabel: PropTypes.string,
      rightPrimaryLabel: PropTypes.string,
      rightSecondaryLabel: PropTypes.string,
    }),
  ),
  onClickItem: PropTypes.func,
  onOpenImportTokenModalClick: PropTypes.func,
  Placeholder: PropTypes.func,
  listTitle: PropTypes.string,
  maxListItems: PropTypes.number,
  searchQuery: PropTypes.string,
  containerRef: PropTypes.shape({
    current: PropTypes.instanceOf(window.Element),
  }),
  hideRightLabels: PropTypes.bool,
  hideItemIf: PropTypes.func,
  listContainerClassName: PropTypes.string,
};
