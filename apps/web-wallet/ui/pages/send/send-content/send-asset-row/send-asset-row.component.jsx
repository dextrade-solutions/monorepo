import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SendRowWrapper from '../send-row-wrapper';
import Identicon from '../../../../components/ui/identicon';
import TokenBalance from '../../../../components/ui/token-balance';
import TokenListDisplay from '../../../../components/app/token-list-display';
import UserPreferencedCurrencyDisplay from '../../../../components/app/user-preferenced-currency-display';
import { PRIMARY } from '../../../../helpers/constants/common';
import { isEqualCaseInsensitive } from '../../../../../shared/modules/string-utils';
import { EVENT } from '../../../../../shared/constants/metametrics';
import {
  AssetType,
  TokenStandard,
} from '../../../../../shared/constants/transaction';
import Box from '../../../../components/ui/box';
import { DISPLAY } from '../../../../helpers/constants/design-system';

export default class SendAssetRow extends Component {
  static propTypes = {
    tokens: PropTypes.arrayOf(
      PropTypes.shape({
        address: PropTypes.string,
        decimals: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        symbol: PropTypes.string,
        image: PropTypes.string,
      }),
    ).isRequired,
    updateSendAsset: PropTypes.func.isRequired,
    nfts: PropTypes.arrayOf(
      PropTypes.shape({
        address: PropTypes.string.isRequired,
        tokenId: PropTypes.string.isRequired,
        name: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.string,
        standard: PropTypes.string,
        imageThumbnail: PropTypes.string,
        imagePreview: PropTypes.string,
        creator: PropTypes.shape({
          address: PropTypes.string,
          config: PropTypes.string,
          profile_img_url: PropTypes.string,
        }),
      }),
    ),
    collections: PropTypes.arrayOf(
      PropTypes.shape({
        address: PropTypes.string.isRequired,
        name: PropTypes.string,
      }),
    ),
    assetInstance: PropTypes.object,
  };

  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  state = {
    isShowingDropdown: false,
    sendableTokens: [],
    sendableNfts: [],
  };

  async componentDidMount() {
    const sendableTokens = this.props.tokens.filter((token) => !token.isERC721);
    const sendableNfts = this.props.nfts.filter(
      (nft) => nft.isCurrentlyOwned && nft.standard === TokenStandard.ERC721,
    );
    this.setState({ sendableTokens, sendableNfts });
  }

  openDropdown = () => this.setState({ isShowingDropdown: true });

  closeDropdown = () => this.setState({ isShowingDropdown: false });

  getAssetSelected = (type, token) => {
    switch (type) {
      case AssetType.native:
        return this.props.assetInstance.sharedProvider.nativeToken.symbol;
      case AssetType.token:
        return TokenStandard.ERC20;
      case AssetType.NFT:
        return token?.standard;
      default:
        return null;
    }
  };

  selectToken = (type, token) => {
    this.setState(
      {
        isShowingDropdown: false,
      },
      () => {
        this.context.trackEvent({
          category: EVENT.CATEGORIES.TRANSACTIONS,
          event: 'User clicks "Assets" dropdown',
          properties: {
            action: 'Send Screen',
            legacy_event: true,
            assetSelected: this.getAssetSelected(type, token),
          },
        });
        this.props.updateSendAsset({
          type,
          details: type === AssetType.native ? null : token,
        });
      },
    );
  };

  render() {
    const { t } = this.context;

    return (
      <SendRowWrapper label={`${t('asset')}:`}>
        <div className="send-v2__asset-dropdown">
          <div className="send-v2__asset-dropdown__input-wrapper">
            {this.renderSendAsset()}
          </div>
          {[...this.state.sendableTokens, ...this.state.sendableNfts].length > 0
            ? this.renderAssetDropdown()
            : null}
        </div>
      </SendRowWrapper>
    );
  }

  renderSendAsset() {
    const { assetInstance, nfts } = this.props;

    if (assetInstance.type === AssetType.NFT) {
      // TODO: Implement in dextrade
      const details = {};

      const nft = nfts.find(
        ({ address, tokenId }) =>
          isEqualCaseInsensitive(address, details.address) &&
          tokenId === details.tokenId,
      );
      if (nft) {
        return this.renderNft(nft);
      }
    }
    return this.renderAsset();
  }

  renderAssetDropdown() {
    return (
      this.state.isShowingDropdown && (
        <div>
          <div
            className="send-v2__asset-dropdown__close-area"
            onClick={this.closeDropdown}
          />
          <div className="send-v2__asset-dropdown__list">
            {this.renderAsset(true)}
            <TokenListDisplay />

            {this.state.sendableNfts.map((nft) => this.renderNft(nft, true))}
          </div>
        </div>
      )
    );
  }

  renderAsset() {
    const { t } = this.context;
    const { assetInstance } = this.props;

    const asset = assetInstance.getRenderableTokenData();

    return (
      <div className="send-v2__asset-dropdown__single-asset">
        <div className="send-v2__asset-dropdown__asset-icon">
          <Identicon
            diameter={36}
            image={asset.iconUrl}
            address={asset.identiconAddress}
          />
        </div>
        <div className="send-v2__asset-dropdown__asset-data">
          <div className="send-v2__asset-dropdown__symbol">
            {asset.primaryLabel}
          </div>
          <div className="send-v2__asset-dropdown__name">
            <span className="send-v2__asset-dropdown__name__label">
              {`${t('balance')}:`}
            </span>
            <UserPreferencedCurrencyDisplay
              value={asset.balance}
              type={PRIMARY}
              shiftBy={asset.decimals}
              ticker={asset.symbol}
              isDecimal
            />
          </div>
          {Boolean(asset.reservedBalance) && (
            <Box display={DISPLAY.FLEX}>
              <span className="send-v2__asset-dropdown__name__label">{`${t(
                'reserve',
              )}:`}</span>
              <span>
                {asset.reservedBalance} {asset.symbol}
              </span>
            </Box>
          )}
        </div>
      </div>
    );
  }

  renderToken(token, insideDropdown = false) {
    const { address, symbol, image } = token;
    const { t } = this.context;

    return (
      <div key={address} className="send-v2__asset-dropdown__asset">
        <div className="send-v2__asset-dropdown__asset-icon">
          <Identicon address={address} diameter={36} image={image} />
        </div>
        <div className="send-v2__asset-dropdown__asset-data">
          <div className="send-v2__asset-dropdown__symbol">{symbol}</div>
          <div className="send-v2__asset-dropdown__name">
            <span className="send-v2__asset-dropdown__name__label">
              {`${t('balance')}:`}
            </span>
            <TokenBalance token={token} />
          </div>
        </div>
        {!insideDropdown && (
          <i className="fa fa-caret-down fa-lg send-v2__asset-dropdown__caret" />
        )}
      </div>
    );
  }

  renderNft(nft, insideDropdown = false) {
    const { address, name, image, tokenId } = nft;
    const { t } = this.context;
    const nftCollection = this.props.collections.find(
      (collection) => collection.address === address,
    );
    return (
      <div
        key={address}
        className="send-v2__asset-dropdown__asset"
        onClick={() => this.selectToken(AssetType.NFT, nft)}
      >
        <div className="send-v2__asset-dropdown__asset-icon">
          <Identicon address={address} diameter={36} image={image} />
        </div>
        <div className="send-v2__asset-dropdown__asset-data">
          <div className="send-v2__asset-dropdown__symbol">
            {nftCollection.name || name}
          </div>
          <div className="send-v2__asset-dropdown__name">
            <span className="send-v2__asset-dropdown__name__label">
              {`${t('tokenId')}:`}
            </span>
            {tokenId}
          </div>
        </div>
        {!insideDropdown && (
          <i className="fa fa-caret-down fa-lg send-v2__asset-dropdown__caret" />
        )}
      </div>
    );
  }
}
