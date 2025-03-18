import './index.scss';

import { Box, BoxProps, Button, Tooltip } from '@mui/material';
import { MiddleTruncate } from '@re-dev/react-truncate';
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
  full,
  color = 'primary',
  ...args
}: {
  data: string;
  shorten?: boolean;
  full?: boolean;
  color?: string;
  tooltipPosition?: 'top' | 'left' | 'bottom' | 'right';
  className?: string;
} & BoxProps) => {
  const { t } = useTranslation();
  const [copied, handleCopy] = useCopyToClipboard();

  const renderLabelContent = () => {
    if (shorten) {
      return shortenAddress(data);
    }

    if (full) {
      return data;
    }
    return <MiddleTruncate end={15}>{data}</MiddleTruncate>;
  };

  return (
    // <Box >
    <Tooltip
      placement={tooltipPosition}
      title={copied ? t('copiedExclamation') : data}
    >
      <Button
        type="link"
        onClick={() => {
          handleCopy(data);
        }}
        color={color}
        fullWidth
        sx={{ lineHeight: 'normal', minWidth: 120 }}
        className={classnames('copy-data', className)}
        {...args}
      >
        <div className="copy-data__label">{renderLabelContent()}</div>
        <Icon name={copied ? 'copy-dex-copied' : 'copy-dex'} size="lg" />
      </Button>
    </Tooltip>
    // </Box>
  );
};

export default CopyData;
