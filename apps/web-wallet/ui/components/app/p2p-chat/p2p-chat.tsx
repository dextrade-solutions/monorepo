import './index.scss';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardProps,
  Collapse,
} from '@mui/material';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { useSelector } from 'react-redux';
import { DEXTRADE_HOST } from '../../../helpers/constants/common';
import { Icon, Text } from '../../component-library';
import { getSelectedIdentity } from '../../../selectors';
import {
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { InputMessage } from './input-message';
import { MessageItem } from './types';
import { UserMessage } from './user-message';

export function P2PChat({
  tradeId,
  userName,
  ...cardProps
}: { tradeId: string; userName: string } & CardProps) {
  const [wsChat, setWsChat] = useState<WebSocket | null>(null);
  const account = useSelector(getSelectedIdentity);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const sessionPubKey = null;

  const [expanded, setExpanded] = useState(true);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const openWebSocket = () => {
    const ws = new WebSocket(
      `wss://${DEXTRADE_HOST}/ws/chat/${tradeId}/${account.session}`,
    );
    ws.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.messages) {
        setMessages(
          data.messages.sort((a: MessageItem, b: MessageItem) => a.cdt - b.cdt),
        );
      } else {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket is closed now. Reopening...');
      setTimeout(() => {
        if (!wsChat || wsChat.readyState === WebSocket.CLOSED) {
          openWebSocket();
        }
      }, 500); // Reconnect after 0.5 second
    };

    ws.onerror = (error) => {
      console.log('WebSocket error:', error);
    };

    setWsChat(ws);
  };

  useEffect(() => {
    openWebSocket();
    return () => {
      if (wsChat) {
        wsChat.close();
      }
    };
  }, [tradeId, sessionPubKey]);

  const onSend = ({ type, value }: { type: string; value: string }) => {
    if (wsChat && wsChat.readyState !== WebSocket.CLOSED) {
      const newMsg = {
        type,
        value,
        cdt: new Date().getTime(),
        isSender: true,
      };
      wsChat.send(JSON.stringify(newMsg));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (expanded) {
      scrollToBottom();
    }
  }, [messages, expanded]);

  return (
    <Card variant="outlined" {...cardProps}>
      <CardActionArea onClick={() => setExpanded(!expanded)}>
        <CardHeader
          title={
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Text
                  color={TextColor.textAlternative}
                  variant={TextVariant.bodySm}
                >
                  Chat
                </Text>
                <Text>{userName}</Text>
              </Box>
              <Icon
                className={classNames('arrow', { 'arrow-rotated': expanded })}
                name="arrow-down"
              />
            </Box>
          }
        />
      </CardActionArea>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Box maxHeight={400} overflow="scroll">
            {messages.map((m, idx) => (
              <UserMessage key={idx} {...m} />
            ))}
            <div ref={messagesEndRef} />
          </Box>
          <InputMessage onSend={onSend} />
        </CardContent>
      </Collapse>
    </Card>
  );
}
