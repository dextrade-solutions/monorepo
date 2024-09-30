import { Divider } from '@mui/material';
import { ICON_SIZES, Icon, Text } from '../../component-library';
import {
  AlignItems,
  DISPLAY,
  IconColor,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import Box from '../../ui/box';

export const RatingOutput = ({
  exchangeCompletionRate,
  exchangeCount,
  totalRating,
}: {
  exchangeCompletionRate: number;
  exchangeCount: number;
  positive: number;
  negative: number;
  totalRating: number;
}) => {
  const totalRatingPercent = (totalRating * 100).toFixed(0);
  const exchangeCompletionRatePercent = (exchangeCompletionRate * 100).toFixed(
    0,
  );
  return (
    <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
      {Boolean(exchangeCount) && (
        <Text
          marginRight={2}
          variant={TextVariant.bodyXs}
          color={TextColor.textAlternative}
        >
          Trades {exchangeCount}
        </Text>
      )}
      {Boolean(exchangeCompletionRate) && (
        <Text
          marginRight={2}
          variant={TextVariant.bodyXs}
          color={TextColor.textAlternative}
        >
          Completion {exchangeCompletionRatePercent}%
        </Text>
      )}
      <Icon
        size={ICON_SIZES.XS}
        name="thumbs-up-down"
        marginRight={1}
        color={IconColor.iconDefault}
      />
      <Text
        marginRight={2}
        variant={TextVariant.bodyXs}
        color={TextColor.textAlternative}
      >
        {totalRatingPercent}%
      </Text>
    </Box>
  );
};
