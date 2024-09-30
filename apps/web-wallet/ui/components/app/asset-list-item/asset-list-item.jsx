import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Identicon from '../../ui/identicon';
import ListItem from '../../ui/list-item';
import Tooltip from '../../ui/tooltip';
import InfoIcon from '../../ui/icon/info-icon.component';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  DISPLAY,
  IconColor,
  JustifyContent,
  SEVERITIES,
  Size,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { TEST_CHAINS } from '../../../../shared/constants/network';
import { Icon, ICON_NAMES, ICON_SIZES, Text } from '../../component-library';
import Box from '../../ui/box/box';
import { isPwa } from '../../../../shared/constants/environment';

const AssetListItem = ({
  className,
  'data-testid': dataTestId,
  iconClassName,
  onClick,
  tokenReservedBalance,
  tokenChainId,
  tokenBalance,
  tokenAddress,
  tokenSymbol,
  tokenImage,
  secondaryLabel,
  hasActiveNetwork,
  warning,
  primary,
  secondary,
  identiconBorder,
  isERC721,
}) => {
  const t = useI18nContext();
  const titleIcon = warning ? (
    <Tooltip
      wrapperClassName="asset-list-item__warning-tooltip"
      interactive
      position="bottom"
      html={warning}
    >
      <InfoIcon severity={SEVERITIES.WARNING} />
    </Tooltip>
  ) : null;

  const midContent = warning ? (
    <>
      <InfoIcon severity={SEVERITIES.WARNING} />
      <div className="asset-list-item__warning">{warning}</div>
    </>
  ) : null;

  const sendTokenButton = useMemo(() => {
    if (!tokenBalance || tokenBalance <= 0) {
      return null;
    }
    return (
      <Box display={DISPLAY.FLEX} justifyContent={JustifyContent.flexEnd}>
        <Tooltip disabled={isPwa} position="top" title={t('swap')}>
          <Icon
            className="asset-list-item__icon-btn asset-list-item__exchange-btn"
            name={ICON_NAMES.SWAP_HORIZONTAL}
            size={Size.LG}
            color={IconColor.primaryDefault}
            marginRight={2}
          />
        </Tooltip>
        <Tooltip
          disabled={isPwa}
          position="top"
          title={t('sendSpecifiedTokens', [tokenSymbol])}
        >
          <Icon
            className="asset-list-item__icon-btn asset-list-item__send-btn"
            name={ICON_NAMES.ARROW_2_RIGHT}
            size={Size.LG}
            color={IconColor.primaryDefault}
            marginRight={2}
          />
        </Tooltip>
      </Box>
    );
  }, [t, tokenBalance, tokenSymbol]);
  const clickRow = () => {
    onClick();
  };

  const renderSubtitle = () => {
    const badges = [];
    if (TEST_CHAINS.some((chain) => chain === tokenChainId)) {
      badges.push(
        <Text
          key="badge-testnet"
          marginRight={2}
          variant={TextVariant.bodyXs}
          color={TextColor.warningDefault}
          className="asset-list-item__token-testnet"
        >
          <Icon
            name={ICON_NAMES.INFO}
            size={ICON_SIZES.XS}
            color={IconColor.warningDefault}
            marginRight={1}
          />
          <span>{t('isTestnet')}</span>
        </Text>,
      );
    }
    if (tokenReservedBalance) {
      badges.push(
        <Text
          key="badge-reserve"
          variant={TextVariant.bodyXs}
          className="asset-list-item__token-reserve"
        >
          <Icon name={ICON_NAMES.LOCK} size={ICON_SIZES.XS} marginRight={1} />
          <span>{tokenReservedBalance}</span>
        </Text>,
      );
    }
    if (!hasActiveNetwork) {
      badges.push(
        <Text
          key="badge-reserve"
          variant={TextVariant.bodyXs}
          className="asset-list-item__token-nonetwork"
        >
          <Icon
            name={ICON_NAMES.INFO}
            size={ICON_SIZES.XS}
            color={IconColor.warningDefault}
            marginRight={1}
          />
          <span>Network isn`t added</span>
        </Text>,
      );
    }
    if (badges.length) {
      return <Box display={DISPLAY.FLEX}>{badges}</Box>;
    }
    return null;
  };

  return (
    <ListItem
      className={classnames('asset-list-item', className)}
      data-testid={dataTestId}
      title={
        <button
          className="asset-list-item__token-button"
          data-testid="token-button"
          onClick={clickRow}
          title={`${primary} ${tokenSymbol}`}
        >
          <h2>
            <span className="asset-list-item__token-value">{primary}</span>
            <span className="asset-list-item__token-symbol">{tokenSymbol}</span>
            {secondaryLabel && (
              <span className="network-type-label">{secondaryLabel}</span>
            )}
          </h2>
          {secondary && (
            <Text title={secondary} color={TextColor.textMuted}>
              {secondary}
            </Text>
          )}
        </button>
      }
      titleIcon={titleIcon}
      subtitle={renderSubtitle()}
      onClick={onClick}
      icon={
        <Identicon
          className={iconClassName}
          diameter={32}
          address={tokenAddress}
          image={tokenImage}
          alt={`${primary} ${tokenSymbol}`}
          imageBorder={identiconBorder}
        />
      }
      midContent={midContent}
      rightContent={!isERC721 && sendTokenButton}
    />
  );
};

AssetListItem.propTypes = {
  className: PropTypes.string,
  'data-testid': PropTypes.string,
  iconClassName: PropTypes.string,
  onClick: PropTypes.func,
  tokenReservedBalance: PropTypes.number,
  tokenAddress: PropTypes.string,
  tokenSymbol: PropTypes.string,
  tokenBalance: PropTypes.string,
  tokenChainId: PropTypes.string,
  tokenImage: PropTypes.string,
  secondaryLabel: PropTypes.string,
  warning: PropTypes.node,
  primary: PropTypes.string,
  secondary: PropTypes.string,
  identiconBorder: PropTypes.bool,
  isERC721: PropTypes.bool,
  hasActiveNetwork: PropTypes.bool,
};

AssetListItem.defaultProps = {
  className: undefined,
  'data-testid': undefined,
  iconClassName: undefined,
  tokenImage: undefined,
  warning: undefined,
  tokenChainId: undefined,
  onClick: undefined,
};

export default AssetListItem;
