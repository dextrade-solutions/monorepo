import React from 'react';
import { ICON_NAMES, Icon, Text } from '../../../components/component-library';
import Box from '../../../components/ui/box';
import {
  AlignItems,
  DISPLAY,
  Size,
  TEXT_ALIGN,
  TextVariant,
} from '../../../helpers/constants/design-system';
import Button from '../../../components/ui/button';
import { ApprovalCard } from './approval-card';

export default function ExchangerForAppoval() {
  const itemsForApproval = [];
  return (
    <Box className="exchanger-for-approval" padding={1} margin={3}>
      <Box
        className="exchanger-for-approval__heading"
        textAlign={TEXT_ALIGN.CENTER}
        marginTop={4}
        marginBottom={4}
      >
        <Text variant={TextVariant.headingSm}>Transactions</Text>
      </Box>
      <Box className="exchanger-for-approval__subheader" display={DISPLAY.FLEX}>
        <Box className="flex-grow">
          <Text>For approval</Text>
          <Text variant={TextVariant.headingLg}>0</Text>
        </Box>
        <Box>
          <Text>BTC - USD</Text>
        </Box>
      </Box>
      <Box display={DISPLAY.FLEX} className="exchanger-for-approval__filters">
        <div className="flex-grow"></div>
        <Button type="sort" size={Size.SM}>
          <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
            <Icon name={ICON_NAMES.ARROW_DOWN} size={Size.SM} marginRight={1} />
            <span>Hour for approval</span>
          </Box>
        </Button>
      </Box>
      <Box className="exchanger-for-approval__content">
        {itemsForApproval.map((i, idx) => (
          <ApprovalCard key={idx} marginBottom={4} marginTop={4} />
        ))}
      </Box>
    </Box>
  );
}
