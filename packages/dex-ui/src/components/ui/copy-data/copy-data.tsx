import './index.scss';

import { Box, BoxProps, Button, Tooltip } from '@mui/material';
import classnames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import Icon from '../icon';

const CopyData = ({
  data,
  tooltipPosition = 'bottom',
  className,
  ...args
}: {
  data: string;
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

export default CopyData;
