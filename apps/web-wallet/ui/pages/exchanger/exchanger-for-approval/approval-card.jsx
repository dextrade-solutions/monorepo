import React from 'react';
import Box from '../../../components/ui/box';
import {
  Color,
  DISPLAY,
  TextColor,
} from '../../../helpers/constants/design-system';
import { Text } from '../../../components/component-library';
import Card from '../../../components/ui/card';
import Button from '../../../components/ui/button';

export function ApprovalCard({ ...props }) {
  return (
    <Card className="approval-card" {...props}>
      <Box display={DISPLAY.FLEX} padding={2}>
        <Text className="flex-grow">Date</Text>
        <Text>18.07.23 18:32:03</Text>
      </Box>
      <div className="divider"></div>
      <Box display={DISPLAY.FLEX} padding={2}>
        <Text className="flex-grow">Hour for approval</Text>
        <Text color={TextColor.successDefault}>00:14:03</Text>
      </Box>
      <div className="divider"></div>
      <Box display={DISPLAY.FLEX} padding={2}>
        <Text className="flex-grow">Exchange ID</Text>
        <Text>1</Text>
      </Box>
      <div className="divider"></div>
      <Box display={DISPLAY.FLEX} padding={2}>
        <Text className="flex-grow">Price</Text>
        <Text>0.01 BTC</Text>
      </Box>
      <div className="divider"></div>
      <Box display={DISPLAY.FLEX} padding={2}>
        <Text className="flex-grow">Earned</Text>
        <Text>0.000002 BTC</Text>
      </Box>
      <div className="divider"></div>
      <Box display={DISPLAY.FLEX} padding={2}>
        <Text className="flex-grow">Price for send</Text>
        <Text>25 USD</Text>
      </Box>
      <div className="divider"></div>
      <Box display={DISPLAY.FLEX} padding={2}>
        <Text className="flex-grow">Client card</Text>
        <Text>1251 1512 9213 3512</Text>
      </Box>
      <Box display={DISPLAY.FLEX} marginTop={4}>
        <Button type="danger-link">Refuse</Button>
        <Button type="link">Approve</Button>
      </Box>
    </Card>
  );
}
