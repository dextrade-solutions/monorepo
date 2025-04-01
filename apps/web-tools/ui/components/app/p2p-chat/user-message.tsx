import { Box, Typography } from '@mui/material';
import { relativeFromCurrentDate } from 'dex-helpers';
import { useGlobalModalContext } from 'dex-ui';
import { useEffect, useState } from 'react';

import { MessageItem } from './types';
import { DEXTRADE_BASE_URL } from '../../../../app/helpers/constants';

export const UserMessage = ({ isSender, value, type, cdt }: MessageItem) => {
  const { showModal } = useGlobalModalContext();
  const imgLink = `${DEXTRADE_BASE_URL}/public/image/${value}`;
  const [relativeTime, setRelativeTime] = useState(
    relativeFromCurrentDate(cdt),
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRelativeTime(relativeFromCurrentDate(cdt));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [cdt]);

  return (
    <Box
      display="flex"
      justifyContent={isSender ? 'flex-end' : 'flex-start'}
      marginY={1}
    >
      <Box
        sx={{ bgcolor: isSender ? 'primary.light' : 'secondary.dark' }}
        padding={type === 'image' ? 0 : 2}
        borderRadius={1}
        maxWidth={400}
        overflow="hidden"
        textAlign={isSender ? 'left' : 'right'}
      >
        {type === 'image' ? (
          <div
            style={{
              borderWidth: 0,
              border: 'none',
              display: 'block',
              maxWidth: '100%',
              minWidth: '300px',
              minHeight: '200px',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              cursor: 'pointer',
              backgroundImage: `url(${imgLink})`,
            }}
            onClick={() => showModal({ name: 'IMAGE_MODAL', link: imgLink })}
          />
        ) : (
          <Typography>{value}</Typography>
        )}
        <Box padding={type === 'image' ? 2 : 0}>
          <Typography variant="caption" color="text.secondary">
            {relativeTime}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
