import { AdPreviewSkeleton, AdPreview } from 'dex-ui';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { SortTypes, SORT_KEYS } from './constants';
import ItemPicker from '../../../../components/app/modals/item-picker';
import {
  ICON_NAMES,
  Icon,
  Text,
} from '../../../../components/component-library';
import Box from '../../../../components/ui/box/box';
import Button from '../../../../components/ui/button';
import { I18nContext } from '../../../../contexts/i18n';
import { getP2PExchanges } from '../../../../ducks/swaps/swaps';
import {
  AlignItems,
  DISPLAY,
  Size,
  TEXT_ALIGN,
  TextColor,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import {
  EXCHANGER_AD_EDIT_ROUTE,
  VIEW_QUOTE_ROUTE,
} from '../../../../helpers/constants/routes';
import { getUserAvatarUrl } from '../../../../helpers/utils/dextrade';
import { getExchanger } from '../../../../selectors';

export default function P2PExchanges({
  fromTokenInputValue,
  currentPage,
  setCurrentPage,
  sort,
  onChangeSort,
}) {
  const t = useContext(I18nContext);
  const exchanger = useSelector(getExchanger);
  const history = useHistory();
  const { items, loading } = useSelector(getP2PExchanges, isEqual);
  const [showSortPicker, setShowSortPicker] = useState(false);

  const inputValue = parseFloat(fromTokenInputValue, 10);

  const toggleSortPicker = () => {
    setShowSortPicker(!showSortPicker);
  };
  return (
    <div className="p2p-exchanges">
      {showSortPicker && (
        <ItemPicker
          title={t('sortBy')}
          value={sort}
          items={Object.entries(SortTypes).map(([key, value]) => ({
            text: t(key),
            value,
          }))}
          onClose={toggleSortPicker}
          onSelect={onChangeSort}
        />
      )}
      <Box
        display={DISPLAY.FLEX}
        alignItems={AlignItems.center}
        marginBottom={2}
      >
        <Text
          variant={TextVariant.bodySm}
          className="flex-grow"
          textAlign={TEXT_ALIGN.LEFT}
        >
          {t('providers')}
        </Text>
        <Button
          disabled={!items.length}
          type="sort"
          size={Size.SM}
          onClick={toggleSortPicker}
        >
          <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
            <Icon name={ICON_NAMES.ARROW_DOWN} size={Size.SM} marginRight={1} />
            <span>{t(SORT_KEYS[sort])}</span>
          </Box>
        </Button>
      </Box>
      {!loading && !items.length && (
        <Text color={TextColor.textMuted}>
          {t('settingsSearchMatchingNotFound')}
        </Text>
      )}
      {Boolean(items.length) && (
        <>
          {items.map((ad) => {
            return (
              <Box key={ad.id} marginTop={2} marginBottom={2}>
                <AdPreview
                  ad={ad}
                  getAvatarLink={(url) => getUserAvatarUrl(url)}
                  fromTokenAmount={inputValue}
                  isSelfAd={exchanger.id === ad.userId}
                  onClick={() => {
                    if (exchanger.id === ad.userId) {
                      history.push(`${EXCHANGER_AD_EDIT_ROUTE}/${ad.id}`);
                    } else {
                      history.push(`${VIEW_QUOTE_ROUTE}/${ad.id}`);
                    }
                  }}
                />
              </Box>
            );
          })}
          <InView
            as="div"
            onChange={(inView) => inView && setCurrentPage(currentPage + 1)}
          >
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <Box key={idx} marginTop={1} marginBottom={1}>
                  <AdPreviewSkeleton />
                </Box>
              ))
            ) : (
              <Box padding={4}></Box>
            )}
          </InView>
        </>
      )}
      {loading &&
        !items.length &&
        [...Array(5)].map((_, idx) => (
          <Box key={idx} marginTop={1} marginBottom={1}>
            <AdPreviewSkeleton />
          </Box>
        ))}
    </div>
  );
}

P2PExchanges.propTypes = {
  fromTokenInputValue: PropTypes.string,
  currentPage: PropTypes.number,
  setCurrentPage: PropTypes.func,
  sort: PropTypes.string,
  onChangeSort: PropTypes.func,
};
