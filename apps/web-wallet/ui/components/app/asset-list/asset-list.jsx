import React, { useContext, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { showModal } from '../../../store/actions';
import {
  getDetectedTokensInCurrentNetwork,
  getIstokenDetectionInactiveOnNonMainnetSupportedNetwork,
} from '../../../selectors';

import DetectedToken from '../detected-token/detected-token';
import TokenCell from '../token-cell/token-cell';
import { I18nContext } from '../../../contexts/i18n';
import { INVALID_ASSET_TYPE } from '../../../helpers/constants/error-keys';
import {
  BUILD_QUOTE_ROUTE,
  IMPORT_TOKEN_ROUTE,
  SEND_ROUTE,
} from '../../../helpers/constants/routes';
import { getAssets } from '../../../ducks/metamask/metamask';
import { ICON_NAMES, Icon, Text } from '../../component-library';
import Button from '../../ui/button';
import Box from '../../ui/box';
import DetectedTokensLink from './detetcted-tokens-link/detected-tokens-link';

const AssetList = () => {
  const [showDetectedTokens, setShowDetectedTokens] = useState(false);
  const history = useHistory();

  const detectedTokens = useSelector(getDetectedTokensInCurrentNetwork) || [];
  const istokenDetectionInactiveOnNonMainnetSupportedNetwork = useSelector(
    getIstokenDetectionInactiveOnNonMainnetSupportedNetwork,
  );
  const dispatch = useDispatch(false);
  const t = useContext(I18nContext);
  const all = useSelector(getAssets);
  if (!all?.length) {
    return (
      <div
        style={{
          display: 'flex',
          height: '250px',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
        }}
      >
        <Box>
          <Text as="div">Tokens are not added</Text>
          <Button
            type="link"
            icon={<Icon name={ICON_NAMES.ADD} />}
            onClick={() => history.push(IMPORT_TOKEN_ROUTE)}
          >
            Add
          </Button>
        </Box>
      </div>
    );
  }
  return (
    <>
      <div>
        {all.map((token, index) => {
          const tokenRenderable = token.getRenderableTokenData();

          return (
            <TokenCell
              {...tokenRenderable}
              key={index + token.localId}
              onClick={async (e) => {
                e && e.stopPropagation();

                const showDetails = () =>
                  dispatch(showModal({ name: 'ACCOUNT_DETAILS', token }));

                if (token.hasActiveNetwork) {
                  if (
                    e.target.classList.contains('asset-list-item__exchange-btn')
                  ) {
                    dispatch(token.startSwap.bind(token));
                    history.push(BUILD_QUOTE_ROUTE);
                  } else if (
                    e.target.classList.contains('asset-list-item__send-btn')
                  ) {
                    try {
                      await dispatch(
                        token.startNewDraftTransaction.bind(token),
                      );
                      history.push(SEND_ROUTE);
                    } catch (err) {
                      if (!err.message.includes(INVALID_ASSET_TYPE)) {
                        throw err;
                      }
                    }
                  } else {
                    showDetails();
                  }
                } else {
                  showDetails();
                }
              }}
            />
          );
        })}
      </div>
      {detectedTokens.length > 0 &&
        !istokenDetectionInactiveOnNonMainnetSupportedNetwork && (
          <DetectedTokensLink setShowDetectedTokens={setShowDetectedTokens} />
        )}
      {/* <Box marginTop={detectedTokens.length > 0 ? 0 : 4}>
        <Box justifyContent={JustifyContent.center}>
          <Typography
            color={Color.textAlternative}
            variant={TypographyVariant.H6}
            fontWeight={FONT_WEIGHT.NORMAL}
          >
            {t('missingToken')}
          </Typography>
        </Box>
        <ImportTokenLink />
      </Box> */}
      {showDetectedTokens && (
        <DetectedToken setShowDetectedTokens={setShowDetectedTokens} />
      )}
    </>
  );
};

export default AssetList;
