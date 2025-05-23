import { Box, Card } from '@mui/material';
import classNames from 'classnames';

import P2PAds from './p2p-ads';
import InputAmount from './p2p-swap/input-amount';
import { useDetectSticky } from '../../hooks/useDetectStycky';
import SelectCoins from '../ui/select-coins';

export default function P2P({ iosIFrame = false }: { iosIFrame?: boolean }) {
  const [isSticky, ref] = useDetectSticky();

  return (
    <Box>
      <Card
        ref={ref}
        className={classNames('select-coins-wrap', {
          'select-coins-wrap--is-sticky': Boolean(isSticky),
        })}
        variant="outlined"
        sx={{ bgcolor: 'primary.light' }}
      >
        <Box padding={2}>
          <SelectCoins includeFiats />
          <InputAmount />
        </Box>
      </Card>
      <P2PAds iosIFrame={iosIFrame} />
    </Box>
  );
}
