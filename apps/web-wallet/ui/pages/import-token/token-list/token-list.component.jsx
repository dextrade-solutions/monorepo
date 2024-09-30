import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ToggleButton from '../../../components/ui/toggle-button';
import {
  ICON_NAMES,
  ICON_SIZES,
  Icon,
  Text,
} from '../../../components/component-library';
import {
  IconColor,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { TEST_CHAINS } from '../../../../shared/constants/network';
import TokenListPlaceholder from './token-list-placeholder';

export default class TokenList extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    results: PropTypes.array,
    selectedTokens: PropTypes.object,
    onToggleToken: PropTypes.func,
  };

  render() {
    const { results = [], selectedTokens = {}, onToggleToken } = this.props;
    const { t } = this.context;

    return results.length === 0 ? (
      <TokenListPlaceholder />
    ) : (
      <div className="token-list">
        <div className="token-list__title">
          {this.context.t('searchResults')}
        </div>
        <div className="token-list__tokens-container">
          {Array(6)
            .fill(undefined)
            .map((_, i) => {
              if (!results[i]) {
                return null;
              }
              const asset = results[i];
              const tokenAlreadyAdded = asset.isExistInWallet;
              const onClick = () => onToggleToken(asset);
              const iconUrl = asset.getIconUrl();

              return (
                <div
                  className={classnames('token-list__token', {
                    'token-list__token--selected':
                      selectedTokens[asset.address],
                  })}
                  onClick={onClick}
                  onKeyPress={(event) => event.key === 'Enter' && onClick()}
                  key={i}
                  tabIndex="0"
                >
                  <div
                    className="token-list__token-icon"
                    style={{
                      backgroundImage: `url(${iconUrl})`,
                    }}
                  />
                  <div className="token-list__token-data">
                    <div className="token-list__token-name">{`${asset.name} (${asset.symbol})`}</div>

                    {TEST_CHAINS.includes(asset.chainId) && (
                      <Text
                        variant={TextVariant.bodyXs}
                        color={TextColor.textMuted}
                      >
                        <Icon
                          name={ICON_NAMES.INFO}
                          size={ICON_SIZES.XS}
                          color={IconColor.warningDefault}
                          marginRight={1}
                        />
                        {t('isTestnet')}
                      </Text>
                    )}
                    {!asset.hasActiveNetwork && (
                      <Text
                        variant={TextVariant.bodyXs}
                        color={TextColor.textMuted}
                      >
                        <Icon
                          name={ICON_NAMES.INFO}
                          size={ICON_SIZES.XS}
                          color={IconColor.warningDefault}
                          marginRight={1}
                        />
                        Network isn`t added
                      </Text>
                    )}
                    <div className="token-list__token-subtitle">
                      {asset.standard}
                    </div>
                  </div>

                  {asset.hasActiveNetwork && (
                    <div>
                      <ToggleButton
                        value={tokenAlreadyAdded}
                        onToggle={(v) => v}
                      />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
