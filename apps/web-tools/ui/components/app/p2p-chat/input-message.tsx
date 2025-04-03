import {
  Box,
  Fade,
  Grow,
  InputAdornment,
  TextField,
  Zoom,
} from '@mui/material';
import { isTMA } from '@telegram-apps/sdk';
import { isMobileWeb } from 'dex-helpers';
import { ButtonIcon } from 'dex-ui';
import React, { useState } from 'react';

import { InputMessageAttachments } from './input-message-attachments';
import P2PService from '../../../../app/services/p2p-service';

export const InputMessage = ({
  onSend,
}: {
  onSend: ({ type, value }: { type: string; value: string }) => void;
}) => {
  const [text, setText] = useState('');
  const [attachmentUpoading, setAttachmentUpoading] = useState(false);

  const messageIsNotEmpty = Boolean(text && text.trim());

  const sendMessage = () => {
    if (messageIsNotEmpty) {
      onSend({ type: 'text', value: text });
      setText('');
    }
  };

  const sendImage = async (v: string) => {
    if (v) {
      setAttachmentUpoading(true);
      try {
        const result = await P2PService.saveImage(v);
        onSend({ type: 'image', value: result.data });
      } finally {
        setAttachmentUpoading(false);
      }
    }
  };

  let boxSxProps = {
    width: '100%',
    transition: 'padding-bottom 0.3s ease-in-out',
    boxSizing: 'border-box',
  };

  if (isTMA() || isMobileWeb) {
    boxSxProps = {
      ...boxSxProps,
      position: 'fixed',
      bottom: 0,
      left: 0,
      padding: (theme) => theme.spacing(2),
      bgcolor: 'primary.light',
    };
  }

  return (
    <Box sx={boxSxProps}>
      <TextField
        value={text}
        placeholder="Write a message..."
        fullWidth
        inputProps={{
          autoComplete: 'off',
          spellCheck: 'false',
          autoCorrect: 'off',
        }}
        variant="outlined"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <InputMessageAttachments
                loading={attachmentUpoading}
                onChange={sendImage}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Box>
                <Zoom in={messageIsNotEmpty}>
                  <div>
                    <ButtonIcon
                      iconName="send-1"
                      color="secondary.contrastText"
                      onClick={() => sendMessage()}
                    />
                  </div>
                </Zoom>
              </Box>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
