import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { getCurrentCurrency } from '../../../selectors';
import LoadingIndicator from '../../ui/loading-indicator';
import {
  TEXT_ALIGN,
  TextColor,
  TextVariant,
  TypographyVariant,
} from '../../../helpers/constants/design-system';
import Chip from '../../ui/chip/chip';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { Icon, ICON_NAMES, ICON_SIZES, Text } from '../../component-library';
import { formatCurrency } from '../../../helpers/utils/confirm-tx.util';
import Box from '../../ui/box/box';
import { useCurrentTokens } from '../../../hooks/useCurrentTokens';

export default function WalletDisplay({
  disabled,
  onClick,
  isAccountMenuOpen,
  selectedIdentity,
}) {
  const t = useI18nContext();
  const { name: nickname } = selectedIdentity;
  const currentCurrency = useSelector(getCurrentCurrency);
  const { totalBalanceFiat } = useCurrentTokens();

  const handleClick = useCallback(() => {
    if (disabled) {
      return;
    }
    onClick && onClick();
  }, [onClick, disabled]);

  return (
    <Chip
      onClick={handleClick}
      disabled={disabled}
      leftIcon={
        <LoadingIndicator
          alt={t('attemptingConnect')}
          title={t('attemptingConnect')}
          isLoading={false}
        />
      }
      rightIcon={
        onClick ? (
          <Icon
            name={
              isAccountMenuOpen ? ICON_NAMES.ARROW_UP : ICON_NAMES.ARROW_DOWN
            }
            size={ICON_SIZES.XS}
          />
        ) : null
      }
      className={classnames('network-display', {
        'network-display--disabled': disabled,
        'network-display--clickable': typeof onClick === 'function',
      })}
      labelProps={{
        variant: TypographyVariant.H7,
      }}
    >
      <Box textAlign={TEXT_ALIGN.CENTER} marginRight={2}>
        <Text color={TextColor.textAlternative}>{nickname}</Text>
        <Text variant={TextVariant.bodySm} color={TextColor.primaryDefault}>
          {formatCurrency(totalBalanceFiat, currentCurrency)}
        </Text>
      </Box>
    </Chip>
  );
}

WalletDisplay.propTypes = {
  //  Whether the WalletDisplay is disabled
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  isAccountMenuOpen: PropTypes.bool,
  selectedIdentity: PropTypes.object,
};
