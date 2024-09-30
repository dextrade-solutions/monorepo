import './index.scss';

import { Box, Button } from '@mui/material';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { I18nContext } from '../../../contexts/i18n';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import Icon from '../icon';
import Tooltip from '../tooltip';

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
            <Icon name={copied ? 'copy-dex-copied' : 'copy-dex'} size="lg" />
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
