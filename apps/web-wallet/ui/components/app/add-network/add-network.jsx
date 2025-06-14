import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { I18nContext } from '../../../contexts/i18n';
import Box from '../../ui/box';
import Typography from '../../ui/typography';
import {
  AlignItems,
  DISPLAY,
  FLEX_DIRECTION,
  FONT_WEIGHT,
  TypographyVariant,
  JustifyContent,
  BorderRadius,
  BackgroundColor,
  TextColor,
  IconColor,
} from '../../../helpers/constants/design-system';
import Button from '../../ui/button';
import Tooltip from '../../ui/tooltip';
import IconWithFallback from '../../ui/icon-with-fallback';
import IconBorder from '../../ui/icon-border';
import {
  getNetworkConfigurations,
  getUnapprovedConfirmations,
} from '../../../selectors';

import {
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_POPUP,
  MESSAGE_TYPE,
  ORIGIN_METAMASK,
} from '../../../../shared/constants/app';
import { requestUserApproval } from '../../../store/actions';
import Popover from '../../ui/popover';
import ConfirmationPage from '../../../pages/confirmation/confirmation';
import { FEATURED_RPCS } from '../../../../shared/constants/network';
import { ADD_NETWORK_ROUTE } from '../../../helpers/constants/routes';
import { getEnvironmentType } from '../../../../app/scripts/lib/util';
import ZENDESK_URLS from '../../../helpers/constants/zendesk-url';
import { Icon, ICON_NAMES, ICON_SIZES } from '../../component-library';
import { EVENT } from '../../../../shared/constants/metametrics';

const AddNetwork = () => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const networkConfigurations = useSelector(getNetworkConfigurations);

  const networkConfigurationChainIds = Object.values(networkConfigurations).map(
    (net) => net.chainId,
  );

  const infuraRegex = /infura.io/u;

  const nets = FEATURED_RPCS.sort((a, b) =>
    a.nickname > b.nickname ? 1 : -1,
  ).slice(0, FEATURED_RPCS.length);

  const notExistingNetworkConfigurations = nets.filter(
    (net) => networkConfigurationChainIds.indexOf(net.chainId) === -1,
  );
  const unapprovedConfirmations = useSelector(getUnapprovedConfirmations);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    const anAddNetworkConfirmationFromMetaMaskExists =
      unapprovedConfirmations?.find((confirmation) => {
        return (
          confirmation.origin === ORIGIN_METAMASK &&
          confirmation.type === MESSAGE_TYPE.ADD_ETHEREUM_CHAIN
        );
      });
    if (!showPopover && anAddNetworkConfirmationFromMetaMaskExists) {
      setShowPopover(true);
    }

    if (showPopover && !anAddNetworkConfirmationFromMetaMaskExists) {
      setShowPopover(false);
    }
  }, [unapprovedConfirmations, showPopover]);

  return (
    <>
      {Object.keys(notExistingNetworkConfigurations).length === 0 ? (
        <Box
          className="add-network__edge-case-box"
          borderRadius={BorderRadius.MD}
          padding={4}
          marginTop={4}
          marginRight={6}
          marginLeft={6}
          display={DISPLAY.FLEX}
          flexDirection={FLEX_DIRECTION.ROW}
          backgroundColor={BackgroundColor.backgroundAlternative}
        >
          <Box marginRight={4}>
            <img src="images/info-fox.svg" />
          </Box>
          <Box>
            <Typography variant={TypographyVariant.H7}>
              {t('youHaveAddedAll', [
                <a
                  key="link"
                  className="add-network__edge-case-box__link"
                  href="https://chainlist.wtf/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('here')}.
                </a>,
                <Button
                  key="button"
                  type="inline"
                  onClick={(event) => {
                    event.preventDefault();
                    getEnvironmentType() === ENVIRONMENT_TYPE_POPUP
                      ? global.platform.openExtensionInBrowser(
                          ADD_NETWORK_ROUTE,
                        )
                      : history.push(ADD_NETWORK_ROUTE);
                  }}
                >
                  <Typography
                    variant={TypographyVariant.H7}
                    color={TextColor.infoDefault}
                  >
                    {t('addMoreNetworks')}.
                  </Typography>
                </Button>,
              ])}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box className="add-network__networks-container">
          {getEnvironmentType() === ENVIRONMENT_TYPE_FULLSCREEN && (
            <Box
              display={DISPLAY.FLEX}
              alignItems={AlignItems.center}
              flexDirection={FLEX_DIRECTION.ROW}
              marginTop={7}
              marginBottom={4}
              paddingBottom={2}
              className="add-network__header"
            >
              <Typography
                variant={TypographyVariant.H4}
                color={TextColor.textMuted}
              >
                {t('networks')}
              </Typography>
              <span className="add-network__header__subtitle">{'  >  '}</span>
              <Typography
                variant={TypographyVariant.H4}
                color={TextColor.textDefault}
              >
                {t('addANetwork')}
              </Typography>
            </Box>
          )}
          <Box
            marginTop={getEnvironmentType() === ENVIRONMENT_TYPE_POPUP ? 0 : 4}
            marginBottom={1}
            className="add-network__main-container"
          >
            <Typography
              variant={TypographyVariant.H6}
              color={TextColor.textAlternative}
              margin={0}
              marginTop={4}
            >
              {t('addFromAListOfPopularNetworks')}
            </Typography>
            <Typography
              variant={TypographyVariant.H7}
              color={TextColor.textMuted}
              marginTop={4}
              marginBottom={3}
            >
              {t('popularCustomNetworks')}
            </Typography>
            {notExistingNetworkConfigurations.map((item, index) => (
              <Box
                key={index}
                display={DISPLAY.FLEX}
                alignItems={AlignItems.center}
                justifyContent={JustifyContent.spaceBetween}
                marginBottom={6}
                className="add-network__list-of-networks"
              >
                <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
                  <Box>
                    <IconBorder size={24}>
                      <IconWithFallback
                        icon={item.rpcPrefs?.imageUrl}
                        name={item.nickname}
                        size={24}
                      />
                    </IconBorder>
                  </Box>
                  <Box marginLeft={2}>
                    <Typography
                      variant={TypographyVariant.H7}
                      color={TextColor.textDefault}
                      fontWeight={FONT_WEIGHT.BOLD}
                    >
                      {item.nickname}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  display={DISPLAY.FLEX}
                  alignItems={AlignItems.center}
                  marginLeft={1}
                >
                  {
                    // Warning for the networks that doesn't use infura.io as the RPC
                    !infuraRegex.test(item.rpcUrl) && (
                      <Tooltip
                        position="top"
                        interactive
                        html={
                          <Box
                            margin={3}
                            className="add-network__warning-tooltip"
                          >
                            {t('addNetworkTooltipWarning', [
                              <a
                                key="zendesk_page_link"
                                href={ZENDESK_URLS.UNKNOWN_NETWORK}
                                rel="noreferrer"
                                target="_blank"
                              >
                                {t('learnMoreUpperCase')}
                              </a>,
                            ])}
                          </Box>
                        }
                        trigger="mouseenter"
                      >
                        <Icon
                          className="add-network__warning-icon"
                          name={ICON_NAMES.DANGER}
                          color={IconColor.iconMuted}
                          size={ICON_SIZES.SM}
                        />
                      </Tooltip>
                    )
                  }
                  <Button
                    type="inline"
                    className="add-network__add-button"
                    onClick={async () => {
                      await dispatch(
                        requestUserApproval({
                          origin: ORIGIN_METAMASK,
                          type: MESSAGE_TYPE.ADD_ETHEREUM_CHAIN,
                          requestData: {
                            chainId: item.chainId,
                            rpcUrl: item.rpcUrl,
                            ticker: item.ticker,
                            rpcPrefs: item.rpcPrefs,
                            imageUrl: item.rpcPrefs?.imageUrl,
                            chainName: item.nickname,
                            referrer: ORIGIN_METAMASK,
                            source: EVENT.SOURCE.NETWORK.POPULAR_NETWORK_LIST,
                          },
                        }),
                      );
                    }}
                  >
                    {t('add')}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
          <Box
            padding={
              getEnvironmentType() === ENVIRONMENT_TYPE_POPUP
                ? [2, 0, 2, 6]
                : [2, 0, 2, 0]
            }
            className="add-network__footer"
          >
            <Button
              type="link"
              data-testid="add-network-manually"
              onClick={(event) => {
                event.preventDefault();
                getEnvironmentType() === ENVIRONMENT_TYPE_POPUP
                  ? global.platform.openExtensionInBrowser(ADD_NETWORK_ROUTE)
                  : history.push(ADD_NETWORK_ROUTE);
              }}
            >
              <Typography
                variant={TypographyVariant.H6}
                color={TextColor.primaryDefault}
              >
                {t('addANetworkManually')}
              </Typography>
            </Button>
          </Box>
        </Box>
      )}
      {showPopover && (
        <Popover>
          <ConfirmationPage redirectToHomeOnZeroConfirmations={false} />
        </Popover>
      )}
    </>
  );
};

export default AddNetwork;
