import { useDispatch } from 'react-redux';

import { DEXTRADE_BASE_URL } from '../../../helpers/constants/common';
import { showModal } from '../../../store/actions';
import { relativeFromCurrentDate } from '../../../helpers/utils/util';
import Box from '../../ui/box';
import {
  BackgroundColor,
  BorderRadius,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { Text } from '../../component-library';
import { MessageItem } from './types';

export const UserMessage = ({ isSender, value, type, cdt }: MessageItem) => {
  const dispatch = useDispatch();
  const imgLink = `${DEXTRADE_BASE_URL}/public/image/${value}`;
  return (
    <Box
      display="flex"
      justifyContent={isSender ? 'flex-start' : 'flex-end'}
      marginTop={1}
      marginBottom={2}
    >
      <Box
        padding={type === 'image' ? 0 : 2}
        borderRadius={BorderRadius.LG}
        maxWidth={400}
        overflow="hidden"
        backgroundColor={
          isSender
            ? BackgroundColor.backgroundDefault
            : BackgroundColor.primaryMuted
        }
        textAlign={isSender ? 'left' : 'right'}
      >
        {type === 'image' ? (
          <div
            style={{
              borderWidth: 0,
              border: 'none',
              display: 'block',
              maxWidth: '100%',
              minWidth: '250px',
              minHeight: '200px',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              cursor: 'pointer',
              backgroundImage: `url(${imgLink})`,
            }}
            onClick={() =>
              dispatch(showModal({ name: 'IMAGE_MODAL', link: imgLink }))
            }
          />
        ) : (
          <Text>{value}</Text>
        )}
        <Box padding={type === 'image' ? 2 : 0}>
          <Text variant={TextVariant.bodySm} color={TextColor.textAlternative}>
            {relativeFromCurrentDate(cdt)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
