import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import Box from '../../../../components/ui/box/box';
import {
  AlignItems,
  DISPLAY,
  IconColor,
  Size,
  TEXT_ALIGN,
  TextColor,
  TextVariant,
  TextWhiteSpace,
  SEVERITIES,
} from '../../../../helpers/constants/design-system';
import UrlIcon from '../../../../components/ui/url-icon';
import {
  BannerAlert,
  ICON_NAMES,
  ICON_SIZES,
  Icon,
  Text,
} from '../../../../components/component-library';
import {
  ExchangerType,
  RATE_SOURCES_META,
} from '../../../../../shared/constants/exchanger';
import { formatCurrency } from '../../../../helpers/utils/confirm-tx.util';
import Button from '../../../../components/ui/button';
import {
  exchangerUserConfirmation,
  exchangerSetActiveDirection,
  exchangerSettingRemove,
  showModal,
} from '../../../../store/actions';
import { getCoinIconByUid } from '../../../../../shared/constants/tokens';
import { p2pTransactionsSelector } from '../../../../selectors';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { EXCHANGER_AD_EDIT_ROUTE } from '../../../../helpers/constants/routes';
import ToggleButton from '../../../../components/ui/toggle-button';
import { formatLongAmount } from '../../../../../shared/lib/ui-utils';

export default function ExchangerStatsCard({
  exchangerSetting,
  onClickForApproval,
  ...boxProps
}) {
  const t = useI18nContext();
  const history = useHistory();
  const dispatch = useDispatch();
  const [expand, setExpand] = useState(false);

  const unpaidP2PTransactions = useSelector((state) =>
    p2pTransactionsSelector(state, exchangerSetting.id),
  )({
    types: [ExchangerType.P2PExchanger],
    unpaid: true,
    exchangerSettingsId: exchangerSetting.id,
  });
  const { from: fromCoin, to: reserveCoin } = exchangerSetting;

  const toggleStatus = async () => {
    await dispatch(
      exchangerSetActiveDirection(
        exchangerSetting.id,
        !exchangerSetting.active,
      ),
    );
  };
  const removeSetting = async () => {
    await dispatch(exchangerSettingRemove(exchangerSetting.id));
  };

  return (
    <Box className="exchange-stats-card" padding={4} {...boxProps}>
      <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
        <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
          <UrlIcon
            url={getCoinIconByUid(reserveCoin.uuid)}
            name={reserveCoin.ticker}
          />
          <Box marginLeft={3} textAlign={TEXT_ALIGN.LEFT}>
            <Text variant={TextVariant.bodyXs} color={TextColor.textMuted}>
              You give
            </Text>
            <Text variant={TextVariant.bodyLgMedium}>{reserveCoin.ticker}</Text>
            {reserveCoin.networkType && (
              <Box className="network-type-label" variant={TextVariant.bodySm}>
                {reserveCoin.networkType}
              </Box>
            )}
          </Box>
        </Box>

        <div className="flex-grow">
          <Icon
            className="exchange-stats-card__exchange-icon"
            name={ICON_NAMES.EXCHANGE_DIRECTION}
            color={IconColor.iconAlternative}
            size={Size.XL}
          />
        </div>

        <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
          <Box marginRight={3} textAlign={TEXT_ALIGN.RIGHT}>
            <Text variant={TextVariant.bodyXs} color={TextColor.textMuted}>
              You get
            </Text>
            <Text variant={TextVariant.bodyLgMedium}>{fromCoin.ticker}</Text>
            {fromCoin.networkType && (
              <Box className="network-type-label">
                {fromCoin.networkType.toUpperCase()}
              </Box>
            )}
          </Box>
          <UrlIcon
            url={getCoinIconByUid(fromCoin.uuid)}
            name={fromCoin.ticker}
          />
        </Box>
      </Box>
      <Box style={{ display: expand ? 'block' : 'none' }} marginTop={4}>
        <Box display={DISPLAY.FLEX} textAlign={TEXT_ALIGN.LEFT}>
          <span className="flex-grow">Number of trades</span>
          <strong>{exchangerSetting.statistic?.transactionCount}</strong>
        </Box>
        <Box
          marginBottom={5}
          display={DISPLAY.FLEX}
          textAlign={TEXT_ALIGN.LEFT}
        >
          <span className="flex-grow">{t('income')}</span>
          <Box textAlign={TEXT_ALIGN.RIGHT}>
            <Text variant={TextVariant.bodyMdBold}>
              {formatLongAmount(
                exchangerSetting.statistic?.amountInCoinFrom || 0,
                fromCoin.ticker,
              )}
            </Text>
            <Text color={TextColor.textAlternative}>
              {formatCurrency(exchangerSetting.statistic?.amountInUsdt, 'usd')}
            </Text>
          </Box>
        </Box>
        <Box display={DISPLAY.FLEX} textAlign={TEXT_ALIGN.LEFT}>
          <span className="flex-grow">{t('priceAdjustment')}</span>
          <strong>{exchangerSetting.priceAdjustment} %</strong>
        </Box>
        <Box display={DISPLAY.FLEX} textAlign={TEXT_ALIGN.LEFT}>
          <span className="flex-grow">{t('transactionFee')}</span>
          {exchangerSetting.transactionFee ? (
            <strong>
              {exchangerSetting.transactionFee} {reserveCoin.ticker}
            </strong>
          ) : (
            <strong>{t('auto')}</strong>
          )}
        </Box>
        <Box display={DISPLAY.FLEX} textAlign={TEXT_ALIGN.LEFT}>
          <span className="flex-grow">{t('minAmount')}</span>
          {exchangerSetting.minimumExchangeAmountCoin1 ? (
            <strong>
              {exchangerSetting.minimumExchangeAmountCoin1} {reserveCoin.ticker}
            </strong>
          ) : (
            <strong>Not specified</strong>
          )}
        </Box>
        <Box display={DISPLAY.FLEX} textAlign={TEXT_ALIGN.LEFT}>
          <span className="flex-grow">{t('price')}</span>
          <strong>
            {formatLongAmount(
              exchangerSetting.priceCoin1InCoin2,
              reserveCoin.ticker,
            )}
          </strong>
        </Box>
        <Box display={DISPLAY.FLEX} textAlign={TEXT_ALIGN.LEFT}>
          <span className="flex-grow">{t('reserve')}</span>
          <strong>
            {formatLongAmount(
              exchangerSetting.reserve?.reserve,
              reserveCoin.ticker,
            )}
          </strong>
        </Box>
        {exchangerSetting.reserveLimitation && (
          <Box display={DISPLAY.FLEX} textAlign={TEXT_ALIGN.LEFT}>
            <span className="flex-grow">{t('reserveLimitation')}</span>
            <strong>
              {exchangerSetting.reserveLimitation} {reserveCoin.ticker}
            </strong>
          </Box>
        )}
        <Box display={DISPLAY.FLEX} textAlign={TEXT_ALIGN.LEFT}>
          <span className="flex-grow">{t('currencyAggregator')}</span>
          <strong>
            {
              RATE_SOURCES_META[exchangerSetting.coinPair?.currencyAggregator]
                ?.title
            }
          </strong>
        </Box>
        {!exchangerSetting.isVerifiedByUser && (
          <BannerAlert
            severity={SEVERITIES.WARNING}
            actionButtonOnClick={() =>
              dispatch(exchangerUserConfirmation(exchangerSetting.id))
            }
            actionButtonLabel="Confirm and enable"
            actionButtonProps={{ type: 'primary' }}
            marginTop={3}
          >
            The ad has been stopped due to recovery or changes to the server.
            Please check and press confirm
          </BannerAlert>
        )}
      </Box>
      <Box className="divider" marginTop={4} marginBottom={4} />

      <Box display={DISPLAY.FLEX}>
        <Button
          className="exchanger-setting__expand-btn flex-shrink"
          type="link"
          onClick={() => setExpand(!expand)}
        >
          <Text variant={TextVariant.bodySm} color={TextColor.inherit}>
            {expand ? 'Hide' : 'More'}
          </Text>
          <Icon
            marginLeft={1}
            size={ICON_SIZES.SM}
            name={expand ? ICON_NAMES.ARROW_UP : ICON_NAMES.ARROW_DOWN}
          />
        </Button>
        <Box className="flex-grow" />
        <ToggleButton
          className="flex-shrink"
          value={exchangerSetting.active}
          statusMode
          onToggle={toggleStatus}
          disabled={!exchangerSetting.isVerifiedByUser}
        />
        {exchangerSetting.isVerifiedByUser ? (
          <Button
            className="exchanger-setting__action-btn flex-shrink"
            type={unpaidP2PTransactions.length > 0 ? 'primary' : null}
            onClick={onClickForApproval}
          >
            <Text
              color={TextColor.inherit}
              variant={TextVariant.bodySm}
              whiteSpace={TextWhiteSpace.nowrap}
            >
              For approval: {unpaidP2PTransactions.length}
            </Text>
          </Button>
        ) : (
          <Text
            marginRight={2}
            variant={TextVariant.bodyXs}
            color={TextColor.warningDefault}
            className="badge-warning"
            onClick={() => setExpand(true)}
          >
            <Icon
              name={ICON_NAMES.INFO}
              size={ICON_SIZES.XS}
              color={IconColor.warningDefault}
              marginRight={1}
            />
            <span>Verify required</span>
          </Text>
        )}

        <Button
          className="exchanger-setting__action-btn flex-shrink"
          type="link"
          onClick={() =>
            history.push(`${EXCHANGER_AD_EDIT_ROUTE}/${exchangerSetting.id}`)
          }
        >
          <Icon
            size={ICON_SIZES.XL}
            name={ICON_NAMES.SETTING_DEX}
            color={IconColor.primaryDefault}
          />
        </Button>
        <Button
          className="exchanger-setting__action-btn flex-shrink"
          type="link"
          onClick={() =>
            dispatch(
              showModal({
                name: 'CONFIRMATION',
                title: `Delete ${fromCoin.ticker} - ${reserveCoin.ticker}`,
                description: 'Are you sure you want to delete this setting?',
                modalProps: {
                  submitText: 'Delete',
                  cancelText: 'Cancel',
                  submitType: 'danger-primary',
                },
                callback: removeSetting,
              }),
            )
          }
        >
          <Icon
            size={ICON_SIZES.XL}
            name={ICON_NAMES.TRASH_DEX}
            color={IconColor.errorDefault}
          />
        </Button>
      </Box>
    </Box>
  );
}

ExchangerStatsCard.propTypes = {
  exchangerSetting: PropTypes.object.isRequired,
  exchangerIsActive: PropTypes.bool,
  onClickForApproval: PropTypes.func,
};
