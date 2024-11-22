import { Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { CopyData } from 'dex-ui';
import { useDispatch } from 'react-redux';

import { Session } from '../../../../app/scripts/controllers/exchanger/types';
import { SessionStatuses } from '../../../../shared/constants/exchanger';
import {
  AlignItems,
  BackgroundColor,
  BorderRadius,
  DISPLAY,
  FONT_WEIGHT,
  IconColor,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { relativeFromCurrentDate } from '../../../helpers/utils/util';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { dextradeRequest, showModal } from '../../../store/actions';
import {
  Button,
  ICON_NAMES,
  ICON_SIZES,
  Icon,
  Text,
} from '../../component-library';
import Box from '../../ui/box';

export default function DextradeSessions() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const { data: sessions = [], refetch } = useQuery({
    queryKey: ['dextradeSessions'],
    retry: false,
    queryFn: () =>
      dispatch(
        dextradeRequest({ url: 'api/user/sessions', showLoading: false }),
      ),
  });
  const STATUS_COLOR = {
    [SessionStatuses.active]: TextColor.successDefault,
    [SessionStatuses.offline]: TextColor.textAlternative,
  };

  const deleteSession = async (id: number) => {
    await dispatch(
      dextradeRequest({
        method: 'POST',
        url: 'api/user/delete/session',
        params: { id },
      }),
    );
    refetch();
  };

  return (
    <Box marginTop={4}>
      <Text variant={TextVariant.headingSm} marginBottom={2}>
        All sessions
      </Text>
      {(sessions as Session[]).map((session) => (
        <Box
          padding={4}
          marginTop={3}
          backgroundColor={BackgroundColor.backgroundDefault}
          borderRadius={BorderRadius.XL}
        >
          <Text fontWeight={FONT_WEIGHT.BOLD} marginBottom={2}>
            {session.name || session.deviceId}
          </Text>
          <Box display={DISPLAY.FLEX}>
            <Text className="flex-grow" color={TextColor.textAlternative}>
              Device ID
            </Text>
            <CopyData data={session.sessionId} />
          </Box>
          <Box display={DISPLAY.FLEX}>
            <Text className="flex-grow" color={TextColor.textAlternative}>
              Status
            </Text>
            <Text color={STATUS_COLOR[session.status]}>
              {session.status === SessionStatuses.active
                ? t(session.status)
                : `Active ${relativeFromCurrentDate(session.lastActive)}`}
            </Text>
          </Box>

          <Box>
            <Box marginTop={2} marginBottom={2}>
              <Divider />
            </Box>
            <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
              <Text className="flex-grow" color={TextColor.textAlternative}>
                Actions
              </Text>

              <Button
                type="link"
                onClick={() =>
                  dispatch(
                    showModal({
                      name: 'EDIT_SESSION',
                      session,
                      onSubmit: refetch,
                    }),
                  )
                }
                marginRight={3}
              >
                <Icon name={ICON_NAMES.EDIT} />
              </Button>
              <Button
                type="link"
                disabled={session.status === SessionStatuses.active}
                onClick={() => deleteSession(session.id)}
              >
                <Icon
                  size={ICON_SIZES.XL}
                  name={ICON_NAMES.TRASH_DEX}
                  color={IconColor.errorDefault}
                />
              </Button>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
