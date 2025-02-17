import './index.scss';

import { Box, BoxProps, Button, Tooltip } from '@mui/material';
import classnames from 'classnames';
import { shortenAddress } from 'dex-helpers';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import Icon from '../icon';

const CopyData = ({
  data,
  tooltipPosition = 'bottom',
  className,
  shorten,
  ...args
}: {
  data: string;
  shorten?: boolean;
  tooltipPosition?: 'top' | 'left' | 'bottom' | 'right';
  className?: string;
} & BoxProps) => {
  const { t } = useTranslation();
  const [copied, handleCopy] = useCopyToClipboard();

  return (
    <Box className={classnames('copy-data', className)} {...args}>
      <Tooltip
        placement={tooltipPosition}
        title={copied ? t('copiedExclamation') : data}
      >
        <Button
          type="link"
          onClick={() => {
            handleCopy(data);
          }}
          sx={{ lineHeight: 'normal' }}
          className="copy-data__button"
        >
          <div className="copy-data__label">
            {shorten ? shortenAddress(data) : data}
          </div>
          <Icon name={copied ? 'copy-dex-copied' : 'copy-dex'} size="lg" />
        </Button>
      </Tooltip>
    </Box>
  );
};

export default CopyData;
