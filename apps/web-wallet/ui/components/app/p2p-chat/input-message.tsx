import { Box, InputAdornment, Zoom } from '@mui/material';
import { useState } from 'react';

import { useDispatch } from 'react-redux';
import { ButtonIcon } from '../../component-library';
import { dextradeRequest } from '../../../store/actions';
import TextField from '../../ui/text-field';
import { IconColor } from '../../../helpers/constants/design-system';
import { InputMessageAttachments } from './input-message-attachments';

export const InputMessage = ({
  onSend,
}: {
  onSend: ({ type, value }: { type: string; value: string }) => void;
}) => {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [attachmentUpoading, setAttachmentUpoading] = useState(false);

  const messageIsNotEmpty = Boolean(text ? text.trim() : null);

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
        const result = await dispatch(
          dextradeRequest({
            method: 'POST',
            url: 'api/chat/save',
            data: { data: v },
          }),
        );
        onSend({ type: 'image', value: result });
      } finally {
        setAttachmentUpoading(false);
      }
    }
  };

  return (
    <Box paddingTop={2}>
      <TextField
        value={text}
        placeholder="Write a message..."
        fullWidth
        autoComplete="off"
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
                      color={IconColor.primaryDefault}
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
