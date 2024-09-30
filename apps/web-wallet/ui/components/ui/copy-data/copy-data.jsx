import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Tooltip from '../tooltip';

import { I18nContext } from '../../../contexts/i18n';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { ICON_NAMES, Icon } from '../../component-library';
import { IconColor, Size } from '../../../helpers/constants/design-system';
import Button from '../button';
import Box from '../box';

const CopyData = ({ data, tooltipPosition = 'bottom', className, ...args }) => {
  const t = useContext(I18nContext);
  const [copied, handleCopy] = useCopyToClipboard();

  return (
    <Box className={classnames('copy-data', className)} {...args}>
      <Tooltip
        position={tooltipPosition}
        title={copied ? t('copiedExclamation') : data}
      >
        <Button
          type="link"
          onClick={() => {
            handleCopy(data);
          }}
          className="copy-data__button"
        >
          <div className="copy-data__label">{data}</div>
          <div className="copy-data__icon">
            <Icon
              name={copied ? ICON_NAMES.COPY_DEX_COPIED : ICON_NAMES.COPY_DEX}
              color={IconColor.primaryDefault}
              size={Size.LG}
            />
          </div>
        </Button>
      </Tooltip>
    </Box>
  );
};

CopyData.propTypes = {
  data: PropTypes.string.isRequired,
  tooltipPosition: PropTypes.string,
  className: PropTypes.string,
};

export default CopyData;
